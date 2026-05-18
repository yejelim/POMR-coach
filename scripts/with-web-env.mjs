import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";

if (existsSync(".env.web.local")) {
  loadEnv({ path: ".env.web.local", quiet: true });
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/with-web-env.mjs <command> [...args]");
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status ?? 1);
