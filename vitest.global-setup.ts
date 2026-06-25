import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Provisions an isolated SQLite database for integration tests from the checked-in
// migrations. This avoids depending on Prisma's schema engine during Vitest
// startup while still exercising real Prisma queries against a real DB.
const TEST_DB_FILE = "test.db";

export default function setup() {
  const root = process.cwd();
  const prismaDir = path.join(root, "prisma");
  const migrationsDir = path.join(prismaDir, "migrations");

  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    try {
      fs.rmSync(path.join(prismaDir, `${TEST_DB_FILE}${suffix}`));
    } catch {
      // file may not exist; ignore
    }
  }

  const db = new Database(path.join(prismaDir, TEST_DB_FILE));

  try {
    db.pragma("foreign_keys = ON");

    for (const migrationFile of listMigrationFiles(migrationsDir)) {
      db.exec(fs.readFileSync(migrationFile, "utf8"));
    }
  } finally {
    db.close();
  }
}

function listMigrationFiles(migrationsDir: string) {
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(migrationsDir, entry.name, "migration.sql"))
    .filter((migrationFile) => fs.existsSync(migrationFile))
    .sort();
}
