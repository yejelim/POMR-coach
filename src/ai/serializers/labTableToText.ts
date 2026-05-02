import { defaultLabTable, type LabTable } from "@/lib/types";

export function labTableToText(table: unknown) {
  const labTable = normalizeLabTable(table);
  if (!labTable.rows.length) return "No lab rows entered.";

  return [
    labTable.columns.join(" | "),
    ...labTable.rows.map((row) =>
      labTable.columns.map((column) => row[column] || "").join(" | "),
    ),
  ].join("\n");
}

export function normalizeLabTable(value: unknown): LabTable {
  if (typeof value === "string") {
    try {
      return normalizeLabTable(JSON.parse(value));
    } catch {
      return defaultLabTable;
    }
  }
  if (!value || typeof value !== "object") return defaultLabTable;
  const candidate = value as Partial<LabTable>;
  const columns = Array.isArray(candidate.columns)
    ? candidate.columns.filter((column): column is string => typeof column === "string")
    : defaultLabTable.columns;
  const rows = Array.isArray(candidate.rows)
    ? candidate.rows.map((row) => {
        const clean: Record<string, string> = {};
        if (row && typeof row === "object") {
          for (const column of columns) {
            clean[column] = String((row as Record<string, unknown>)[column] ?? "");
          }
        }
        return clean;
      })
    : [];
  return { schemaVersion: 1, columns, rows };
}
