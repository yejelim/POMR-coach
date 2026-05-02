type ProgressProblemLike = {
  titleSnapshot: string;
  subjective: string;
  objectivePe: string;
  objectiveLab: string;
  objectiveImageProcedure: string;
  objectiveDrain: string;
  assessment: string;
  planDx: string;
  planTx: string;
  planMonitoring: string;
  planEducation: string;
};

export function progressNoteToText(rows: ProgressProblemLike[]) {
  if (!rows.length) return "No SOAP problems entered.";

  return rows
    .map((row, index) =>
      [
        `#${index + 1} ${row.titleSnapshot || "(untitled problem)"}`,
        `S: ${row.subjective || "-"}`,
        `O/PE: ${row.objectivePe || "-"}`,
        `O/Lab: ${row.objectiveLab || "-"}`,
        `O/Image or procedure: ${row.objectiveImageProcedure || "-"}`,
        `O/Drain: ${row.objectiveDrain || "-"}`,
        `A: ${row.assessment || "-"}`,
        `P/Dx: ${row.planDx || "-"}`,
        `P/Tx: ${row.planTx || "-"}`,
        `P/Monitoring: ${row.planMonitoring || "-"}`,
        `P/Education: ${row.planEducation || "-"}`,
      ].join("\n"),
    )
    .join("\n\n");
}
