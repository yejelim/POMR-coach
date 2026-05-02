type ProblemLike = {
  priority: number;
  title: string;
  status: string;
  evidence: string;
  notes: string;
};

export function problemListToText(rows: ProblemLike[]) {
  if (!rows.length) return "No problem list entered.";

  return rows
    .map((row) =>
      [
        `#${row.priority} ${row.title || "(untitled)"}`,
        `Status: ${row.status}`,
        `Evidence: ${row.evidence || "-"}`,
        `Notes: ${row.notes || "-"}`,
      ].join("\n"),
    )
    .join("\n\n");
}
