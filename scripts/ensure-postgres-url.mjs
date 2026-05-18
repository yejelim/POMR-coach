import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";

if (existsSync(".env.web.local")) {
  loadEnv({ path: ".env.web.local", quiet: true });
}

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
  console.error(
    "DATABASE_URL must be a PostgreSQL connection string before running a web database command.",
  );
  process.exit(1);
}
