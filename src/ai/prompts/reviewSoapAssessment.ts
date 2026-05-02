import { feedbackJsonInstruction } from "./shared";

export function reviewSoapAssessmentPrompt(input: {
  caseText: string;
  problemListText: string;
  progressNoteText: string;
}) {
  return `
Review the Assessment portions of this problem-based SOAP progress note.

Focus especially on:
- whether A interprets data rather than repeating O
- whether each problem is improving, worsening, or stable
- whether P follows A
- whether monitoring points are missing
- whether the note remains educational and de-identified

Do not rewrite the SOAP note. Give revision guidance only.
${feedbackJsonInstruction}

CASE CONTEXT
${input.caseText}

PROBLEM LIST
${input.problemListText}

PROGRESS NOTE SOAP
${input.progressNoteText}
`.trim();
}
