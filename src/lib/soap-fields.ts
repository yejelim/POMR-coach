import type { ProgressProblemDraft, SoapSubfield } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";

export const defaultObjectiveLabels = ["Physical examination", "Lab", "Image / Procedure"];
export const defaultPlanLabels = ["Diagnosis", "Treatment", "Education"];

export function makeSoapField(label: string, value = ""): SoapSubfield {
  return {
    id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cryptoSafeId()}`,
    label,
    value,
  };
}

export function objectiveItemsFromProblem(row: {
  objectiveItems?: string | SoapSubfield[] | null;
  objectivePe?: string;
  objectiveLab?: string;
  objectiveImageProcedure?: string;
  objectiveDrain?: string;
}) {
  const stored = parseStoredJson<SoapSubfield[]>(row.objectiveItems, []);
  if (stored.length) return stored.map(normalizeObjectiveLabel);

  const defaults = [
    makeSoapField("Physical examination", row.objectivePe ?? ""),
    makeSoapField("Lab", row.objectiveLab ?? ""),
    makeSoapField("Image / Procedure", row.objectiveImageProcedure ?? ""),
  ];
  if (row.objectiveDrain) defaults.push(makeSoapField("Drain", row.objectiveDrain));
  return defaults;
}

export function planItemsFromProblem(row: {
  planItems?: string | SoapSubfield[] | null;
  planDx?: string;
  planTx?: string;
  planMonitoring?: string;
  planEducation?: string;
}) {
  const stored = parseStoredJson<SoapSubfield[]>(row.planItems, []);
  if (stored.length) return stored.map(normalizePlanLabel);

  const defaults = [
    makeSoapField("Diagnosis", row.planDx ?? ""),
    makeSoapField("Treatment", row.planTx ?? ""),
    makeSoapField("Education", row.planEducation ?? ""),
  ];
  if (row.planMonitoring) defaults.push(makeSoapField("Monitoring", row.planMonitoring));
  return defaults;
}

export function mergeLegacySoapFields(row: ProgressProblemDraft): ProgressProblemDraft {
  const objectiveItems = row.objectiveItems ?? objectiveItemsFromProblem(row);
  const planItems = row.planItems ?? planItemsFromProblem(row);

  return {
    ...row,
    objectiveItems,
    objectivePe: findFirstValue(objectiveItems, ["Physical examination", "Physical Exam", "PE"]),
    objectiveLab: findValue(objectiveItems, "Lab"),
    objectiveImageProcedure: findValue(objectiveItems, "Image / Procedure"),
    objectiveDrain: findValue(objectiveItems, "Drain"),
    planItems,
    planDx: findFirstValue(planItems, ["Diagnosis", "Dx"]),
    planTx: findFirstValue(planItems, ["Treatment", "Tx"]),
    planEducation: findFirstValue(planItems, ["Education", "Edu"]),
    planMonitoring: findValue(planItems, "Monitoring"),
  };
}

export function findValue(items: SoapSubfield[], label: string) {
  return items.find((item) => item.label === label)?.value ?? "";
}

function findFirstValue(items: SoapSubfield[], labels: string[]) {
  for (const label of labels) {
    const value = findValue(items, label);
    if (value) return value;
  }
  return "";
}

function normalizeObjectiveLabel(item: SoapSubfield): SoapSubfield {
  if (item.label === "PE" || item.label === "Physical Exam") {
    return { ...item, label: "Physical examination" };
  }
  return item;
}

function normalizePlanLabel(item: SoapSubfield): SoapSubfield {
  if (item.label === "Dx") return { ...item, label: "Diagnosis" };
  if (item.label === "Tx") return { ...item, label: "Treatment" };
  if (item.label === "Edu") return { ...item, label: "Education" };
  return item;
}

function cryptoSafeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
