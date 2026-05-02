import { feedbackJsonInstruction } from "./shared";

export function reviewProblemListPrompt(input: {
  caseText: string;
  finalImpressionText: string;
  problemListText: string;
}) {
  return `
Review this problem list draft for problem-based SOAP progress notes.

Focus on:
- missing clinically relevant problems from the available case text
- merge/split suggestions
- active vs background distinction
- priority ordering
- suitability for daily SOAP notes

Do not generate a replacement problem list. Give revision guidance only.
${feedbackJsonInstruction}

CASE CONTEXT
${input.caseText}

FINAL IMPRESSION
${input.finalImpressionText}

PROBLEM LIST
${input.problemListText}
`.trim();
}
