import { z } from "zod";

export const aiFeedbackSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  missingData: z.array(z.string()),
  revisionChecklist: z.array(z.string()),
  safetyPrivacyFlags: z.array(z.string()),
});

export const aiFeedbackJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "strengths",
    "concerns",
    "missingData",
    "revisionChecklist",
    "safetyPrivacyFlags",
  ],
  properties: {
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
    missingData: { type: "array", items: { type: "string" } },
    revisionChecklist: { type: "array", items: { type: "string" } },
    safetyPrivacyFlags: { type: "array", items: { type: "string" } },
  },
} as const;
