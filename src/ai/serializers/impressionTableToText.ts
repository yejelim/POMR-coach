type ImpressionLike = {
  rank: number;
  title: string;
  evidence: string;
  evidenceAgainst: string;
  missingData?: string;
  dxPlan: string;
  txPlan: string;
};

export function impressionTableToText(rows: ImpressionLike[]) {
  if (!rows.length) return "No impression rows entered.";

  return rows
    .map((row) =>
      [
        `#${row.rank} ${row.title || "(untitled)"}`,
        `Evidence: ${row.evidence || "-"}`,
        `Against/uncertainty: ${row.evidenceAgainst || "-"}`,
        row.missingData ? `Missing data: ${row.missingData}` : null,
        `Dx plan: ${row.dxPlan || "-"}`,
        `Tx plan: ${row.txPlan || "-"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}
