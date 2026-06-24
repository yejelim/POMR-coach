// Ensures prisma/schema.prisma (sqlite) and prisma/schema.postgres.prisma (postgres)
// stay in sync. The two files must be identical except for the datasource provider.
// Run via `npm run check:schema` (also wired into CI).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sqlitePath = path.join(root, "prisma", "schema.prisma");
const postgresPath = path.join(root, "prisma", "schema.postgres.prisma");

// Strip the one legitimately-different line (datasource provider) plus comments and
// blank lines so formatting drift never masks a real model/field divergence.
function normalize(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//"))
    .filter((line) => !/^provider\s*=\s*"(sqlite|postgresql)"$/.test(line))
    .join("\n");
}

const sqlite = normalize(fs.readFileSync(sqlitePath, "utf8"));
const postgres = normalize(fs.readFileSync(postgresPath, "utf8"));

if (sqlite !== postgres) {
  const sqliteLines = sqlite.split("\n");
  const postgresLines = postgres.split("\n");
  const max = Math.max(sqliteLines.length, postgresLines.length);
  const diffs = [];
  for (let i = 0; i < max && diffs.length < 10; i += 1) {
    if (sqliteLines[i] !== postgresLines[i]) {
      diffs.push(
        `  line ${i + 1}:\n    sqlite:   ${sqliteLines[i] ?? "(none)"}\n    postgres: ${postgresLines[i] ?? "(none)"}`,
      );
    }
  }
  console.error(
    "Prisma schema drift: schema.prisma and schema.postgres.prisma differ beyond the datasource provider.\n" +
      diffs.join("\n"),
  );
  process.exit(1);
}

console.log("Prisma schema parity OK (sqlite and postgres schemas match).");
