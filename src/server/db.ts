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
const adapter = isPostgresUrl
  ? new PrismaPg(getPostgresPoolConfig(databaseUrl))
  : new PrismaBetterSqlite3({ url: databaseUrl });

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
    if (url.hostname.endsWith(".supabase.com")) {
      url.searchParams.delete("sslmode");
      url.searchParams.delete("sslcert");
      url.searchParams.delete("sslkey");
      url.searchParams.delete("sslrootcert");
      url.searchParams.delete("pgbouncer");
      url.searchParams.delete("connection_limit");
      url.searchParams.delete("pool_timeout");
      config.connectionString = url.toString();
      config.ssl = { rejectUnauthorized: false };
    }
  } catch {
    return config;
  }

  return config;
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
    diagnostics["protocol"] = url.protocol.replace(":", "");
    diagnostics["host"] = url.hostname;
    diagnostics["port"] = url.port || "(default)";
    diagnostics["database"] = url.pathname.replace(/^\//, "") || "(none)";
    diagnostics["usernamePresent"] = Boolean(url.username);
    diagnostics["passwordPresent"] = Boolean(url.password);
    diagnostics["sslmode"] = url.searchParams.get("sslmode") ?? "(none)";
    diagnostics["isSupabaseHost"] = url.hostname.endsWith(".supabase.com");
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
