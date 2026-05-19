import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ??= "postgresql://build:build@localhost:5432/pomr_coach_build?sslmode=require";
process.env.AI_MOCK_MODE ??= "true";
process.env.APP_URL ??= "http://localhost:8080";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/with-cloudrun-build-env.mjs <command> [...args]");
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status ?? 1);
