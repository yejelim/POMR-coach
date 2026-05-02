import { feedbackJsonInstruction } from "./shared";

export function reviewInitialImpressionPrompt(input: {
  caseText: string;
  initialImpressionText: string;
}) {
  return `
Review this PRE-TEST initial impression table. The student should reason only from interview, ROS, and physical exam at this stage.

Focus on:
- ranked DDx quality
- evidence from Hx/ROS/PE
- evidence against and uncertainty
- missing data
- whether Dx/Tx plans are framed as plans, not final certainty

${feedbackJsonInstruction}

CASE CONTEXT
${input.caseText}

INITIAL IMPRESSION TABLE
${input.initialImpressionText}
`.trim();
}
