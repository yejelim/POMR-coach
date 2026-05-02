import { feedbackJsonInstruction } from "./shared";

export function reviewFinalImpressionPrompt(input: {
  caseText: string;
  initialImpressionText: string;
  diagnosticText: string;
  finalImpressionText: string;
}) {
  return `
Review this POST-TEST final impression table. Compare how reasoning changed after lab/image/procedure results.

Focus on:
- whether final impressions are supported by new data
- whether uncertainty remains explicit
- whether the change from pre-test to post-test reasoning is explained
- whether plans follow the revised assessment

${feedbackJsonInstruction}

CASE CONTEXT
${input.caseText}

PRE-TEST INITIAL IMPRESSION
${input.initialImpressionText}

LAB / IMAGE / PROCEDURE DATA
${input.diagnosticText}

FINAL IMPRESSION TABLE
${input.finalImpressionText}
`.trim();
}
