import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const rawDatabaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const isPostgresUrl = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

// Per-user auth isolation is handled by Supabase when configured (see
// getCurrentUser). There is intentionally no boot-time hard requirement on it, so
// an internal/testing deployment runs without extra setup. Do NOT expose a
// non-Supabase (shared-identity) instance to untrusted/public users.

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
      // Supabase's pooler presents a certificate chain Node cannot verify against its
      // default trust store ("self-signed certificate in certificate chain"), so strict
      // verification breaks ALL database access (every query throws). Keep the
      // connection TLS-encrypted but skip chain verification — the prior working setup.
      config.ssl = { rejectUnauthorized: false };
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
