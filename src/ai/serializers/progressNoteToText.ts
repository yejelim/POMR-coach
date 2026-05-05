import { objectiveItemsFromProblem, planItemsFromProblem } from "@/lib/soap-fields";

type ProgressProblemLike = {
  titleSnapshot: string;
  subjective: string;
  objectiveItems?: string | null;
  objectivePe: string;
  objectiveLab: string;
  objectiveImageProcedure: string;
  objectiveDrain: string;
  assessment: string;
  planItems?: string | null;
  planDx: string;
  planTx: string;
  planMonitoring: string;
  planEducation: string;
};

export function progressNoteToText(rows: ProgressProblemLike[]) {
  if (!rows.length) return "No SOAP problems entered.";

  return rows
    .map((row, index) => {
      const objectiveItems = objectiveItemsFromProblem(row)
        .map((item) => `O/${item.label}: ${item.value || "-"}`)
        .join("\n");
      const planItems = planItemsFromProblem(row)
        .map((item) => `P/${item.label}: ${item.value || "-"}`)
        .join("\n");
      return [
        `#${index + 1} ${row.titleSnapshot || "(untitled problem)"}`,
        `S: ${row.subjective || "-"}`,
        objectiveItems,
        `A: ${row.assessment || "-"}`,
        planItems,
      ].join("\n");
    })
    .join("\n\n");
}
