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

try {
  const url = new URL(databaseUrl);
  const password = decodeURIComponent(url.password);
  if (!password || /your[-_ ]?password|password|\[.*\]/i.test(password)) {
    console.error(
      "DATABASE_URL still contains a placeholder password. Replace [PASSWORD] with the real Supabase database password.",
    );
    process.exit(1);
  }

  const isSupabaseHost = url.hostname.endsWith(".supabase.com");
  if (isSupabaseHost && url.searchParams.get("sslmode") !== "require") {
    console.error(
      "Supabase DATABASE_URL must include ?sslmode=require. Example: postgresql://.../postgres?sslmode=require",
    );
    process.exit(1);
  }
} catch {
  console.error("DATABASE_URL must be a valid PostgreSQL URL.");
  process.exit(1);
}
