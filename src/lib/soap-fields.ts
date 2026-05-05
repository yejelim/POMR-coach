import type { ProgressProblemDraft, SoapSubfield } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";

export const defaultObjectiveLabels = ["PE", "Lab", "Image / Procedure"];
export const defaultPlanLabels = ["Dx", "Tx", "Edu"];

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
  if (stored.length) return stored;

  const defaults = [
    makeSoapField("PE", row.objectivePe ?? ""),
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
  if (stored.length) return stored;

  const defaults = [
    makeSoapField("Dx", row.planDx ?? ""),
    makeSoapField("Tx", row.planTx ?? ""),
    makeSoapField("Edu", row.planEducation ?? ""),
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
    objectivePe: findValue(objectiveItems, "PE"),
    objectiveLab: findValue(objectiveItems, "Lab"),
    objectiveImageProcedure: findValue(objectiveItems, "Image / Procedure"),
    objectiveDrain: findValue(objectiveItems, "Drain"),
    planItems,
    planDx: findValue(planItems, "Dx"),
    planTx: findValue(planItems, "Tx"),
    planEducation: findValue(planItems, "Edu"),
    planMonitoring: findValue(planItems, "Monitoring"),
  };
}

export function findValue(items: SoapSubfield[], label: string) {
  return items.find((item) => item.label === label)?.value ?? "";
}

function cryptoSafeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
