import { z } from "zod";

// Lenient runtime validation for the JSON payloads that editors submit via hidden
// form fields. Field-level .catch() coerces minor issues (so a usable row is never
// dropped), while parseDraftArray() drops only items that aren't even objects.
// This prevents a malformed/stale/hand-crafted payload from throwing in a server
// action and discarding the user's whole form.

// .default() handles a missing key; .catch() handles a present-but-wrong-typed
// value. Both are needed in Zod 4, where .catch() alone does not rescue undefined.
const str = z.string().default("").catch("");
const optionalId = z.string().min(1).optional().catch(undefined);
const optionalStr = z.string().optional().catch(undefined);
const optionalBool = z.boolean().optional().catch(undefined);
const num = (fallback: number) => z.coerce.number().default(fallback).catch(fallback);
const optionalNum = z.coerce.number().optional().catch(undefined);

const problemStatusValues = ["active", "improving", "worsening", "resolved", "background"] as const;
const problemStatus = z.enum(problemStatusValues).default("active").catch("active");
const optionalProblemStatus = z.enum(problemStatusValues).optional().catch(undefined);

export const timelineDraftSchema = z.object({
  id: optionalId,
  timepoint: str,
  event: str,
  interpretation: str,
  question: str,
});

export const impressionDraftSchema = z.object({
  id: optionalId,
  rank: num(1),
  title: str,
  evidence: str,
  evidenceAgainst: str,
  missingData: str,
  dxPlan: str,
  txPlan: str,
});

export const problemDraftSchema = z.object({
  id: optionalId,
  priority: num(1),
  title: str,
  status: problemStatus,
  evidence: str,
  linkedImpressionRowId: optionalStr,
  notes: str,
});

const soapSubfieldSchema = z.object({
  id: str,
  label: str,
  value: str,
});

const uploadedImageSchema = z.object({
  id: str,
  fileName: str,
  mimeType: str,
  dataUrl: str,
  caption: optionalStr,
  note: optionalStr,
  createdAt: optionalStr,
  originalBytes: optionalNum,
  storedBytes: optionalNum,
  width: optionalNum,
  height: optionalNum,
  compressed: optionalBool,
});

export const progressProblemDraftSchema = z.object({
  id: optionalId,
  problemId: optionalStr,
  progressStatus: optionalProblemStatus,
  titleSnapshot: str,
  subjective: str,
  objectiveItems: z.array(soapSubfieldSchema).default([]).catch([]),
  objectiveImages: z.array(uploadedImageSchema).default([]).catch([]),
  objectivePe: str,
  objectiveLab: str,
  objectiveImageProcedure: str,
  objectiveDrain: str,
  assessment: str,
  planItems: z.array(soapSubfieldSchema).default([]).catch([]),
  planDx: str,
  planTx: str,
  planMonitoring: str,
  planEducation: str,
});

/**
 * JSON-parse a hidden form field and validate it as an array of `rowSchema`.
 * Returns [] if the value is missing or not a JSON array; drops any individual
 * element that fails validation. Never throws.
 */
export function parseDraftArray<S extends z.ZodTypeAny>(
  value: FormDataEntryValue | null,
  rowSchema: S,
): z.infer<S>[] {
  if (!value) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(value));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const rows: z.infer<S>[] = [];
  for (const item of parsed) {
    const result = rowSchema.safeParse(item);
    if (result.success) rows.push(result.data);
  }
  return rows;
}
