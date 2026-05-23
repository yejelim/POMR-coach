import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const isPostgresUrl = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
const adapter = isPostgresUrl
  ? new PrismaPg(getPostgresPoolConfig(databaseUrl))
  : new PrismaBetterSqlite3({ url: databaseUrl });

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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
