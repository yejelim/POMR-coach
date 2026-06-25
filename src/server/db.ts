import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { isSupabaseConfigured } from "@/server/auth/supabase-env";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const rawDatabaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const isPostgresUrl = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

// Fail closed: a Postgres (web / multi-tenant) deployment MUST have Supabase auth
// configured. Without it, getCurrentUser() would fall back to a single shared
// identity and disable all per-user data isolation. Crash on boot in production
// rather than silently expose every user's clinical notes to everyone.
// (Skipped during `next build` where runtime auth env may be absent.)
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  isPostgresUrl &&
  !isSupabaseConfigured()
) {
  throw new Error(
    "Refusing to start: DATABASE_URL is Postgres but Supabase auth is not configured. " +
      "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY — per-user isolation depends on it.",
  );
}

const adapter = isPostgresUrl
  ? new PrismaPg(getPostgresPoolConfig(databaseUrl))
  : new PrismaBetterSqlite3({ url: databaseUrl });

/** True when the active datasource is Postgres (the web / multi-tenant mode). */
export function isPostgresDatabase() {
  return isPostgresUrl;
}

function normalizeDatabaseUrl(value: string) {
  const trimmed = value.trim();
  const first = trimmed.at(0);
  const last = trimmed.at(-1);

  if ((first === `"` && last === `"`) || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function getPostgresPoolConfig(connectionString: string): PoolConfig {
  const config: PoolConfig = {
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  };

  try {
    const url = new URL(connectionString);
    if (isSupabaseHostname(url.hostname)) {
      url.searchParams.delete("sslmode");
      url.searchParams.delete("sslcert");
      url.searchParams.delete("sslkey");
      url.searchParams.delete("sslrootcert");
      url.searchParams.delete("pgbouncer");
      url.searchParams.delete("connection_limit");
      url.searchParams.delete("pool_timeout");
      config.connectionString = url.toString();
      // Verify the server certificate by default (Supabase uses a publicly-trusted
      // CA). Only disable verification via an explicit opt-out for unusual setups.
      const allowInsecure = process.env.DATABASE_SSL_NO_VERIFY === "true";
      config.ssl = { rejectUnauthorized: !allowInsecure };
    }
  } catch {
    return config;
  }

  return config;
}

function isSupabaseHostname(hostname: string) {
  return hostname.endsWith(".supabase.com") || hostname.endsWith(".supabase.co");
}

export function getDatabaseUrlDiagnostics() {
  const normalized = databaseUrl;
  const hasWrappingQuotes =
    (rawDatabaseUrl.trim().startsWith(`"`) && rawDatabaseUrl.trim().endsWith(`"`)) ||
    (rawDatabaseUrl.trim().startsWith("'") && rawDatabaseUrl.trim().endsWith("'"));
  const hasOuterWhitespace = rawDatabaseUrl !== rawDatabaseUrl.trim();
  const hasPlaceholder =
    normalized.includes("[YOUR-PASSWORD]") ||
    normalized.includes("[PASSWORD]") ||
    normalized.includes("<PASSWORD>");

  const diagnostics: Record<string, unknown> = {
    present: Boolean(process.env.DATABASE_URL),
    normalized: normalized !== rawDatabaseUrl,
    hasWrappingQuotes,
    hasOuterWhitespace,
    hasPlaceholder,
    length: normalized.length,
    kind: isPostgresUrl ? "postgres" : normalized.startsWith("file:") ? "sqlite" : "unknown",
  };

  if (!isPostgresUrl) return diagnostics;

  try {
    const url = new URL(normalized);
    // Intentionally omit host/port/database/protocol: these endpoints are
    // unauthenticated, so we expose only non-identifying booleans/enums that help
    // diagnose a misconfiguration without mapping the backend for an attacker.
    diagnostics["usernamePresent"] = Boolean(url.username);
    diagnostics["passwordPresent"] = Boolean(url.password);
    diagnostics["sslmode"] = url.searchParams.get("sslmode") ?? "(none)";
    diagnostics["isSupabaseHost"] = isSupabaseHostname(url.hostname);
  } catch (error) {
    diagnostics["parseError"] = error instanceof Error ? error.message : "Invalid URL";
  }

  return diagnostics;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Drain the Postgres connection pool on shutdown. Cloud Run sends SIGTERM on
// scale-down; releasing connections promptly avoids exhausting Supabase's caps.
if (isPostgresUrl && process.env.NODE_ENV === "production") {
  const disconnect = () => {
    void prisma.$disconnect();
  };
  process.once("SIGTERM", disconnect);
  process.once("SIGINT", disconnect);
}
