import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Provisions an isolated SQLite database for integration tests by pushing the
// Prisma schema into prisma/test.db. Runs once before the test suite. Keeping a
// real DB (rather than mocks) lets us test owner-scoping and data-integrity
// behavior against actual Prisma queries.
const TEST_DB_FILE = "test.db";

export default function setup() {
  const root = process.cwd();
  const prismaDir = path.join(root, "prisma");

  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    try {
      fs.rmSync(path.join(prismaDir, `${TEST_DB_FILE}${suffix}`));
    } catch {
      // file may not exist; ignore
    }
  }

  const prismaBin = path.join(root, "node_modules", "prisma", "build", "index.js");
  execFileSync(process.execPath, [prismaBin, "db", "push"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: `file:./prisma/${TEST_DB_FILE}` },
  });
}
