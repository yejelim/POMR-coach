import { prisma } from "@/server/db";
import { getCaseBundleForOwner, getProgressNoteForOwner } from "@/server/services/case-service";
import { caseToPrompt } from "@/ai/serializers/caseToPrompt";
import { impressionTableToText } from "@/ai/serializers/impressionTableToText";
import { labTableToText } from "@/ai/serializers/labTableToText";
import { problemListToText } from "@/ai/serializers/problemListToText";
import { progressNoteToText } from "@/ai/serializers/progressNoteToText";
import { reviewFinalImpressionPrompt } from "@/ai/prompts/reviewFinalImpression";
import { reviewInitialImpressionPrompt } from "@/ai/prompts/reviewInitialImpression";
import { reviewProblemListPrompt } from "@/ai/prompts/reviewProblemList";
import { reviewSoapAssessmentPrompt } from "@/ai/prompts/reviewSoapAssessment";
import { requestAiFeedback } from "@/ai/provider";
import { stableHash, stringifyStoredJson } from "@/lib/utils";
import type { AiReviewType } from "@/lib/types";

export async function runAiReview(input: {
  caseId: string;
  reviewType: AiReviewType;
  targetId?: string;
}, ownerId?: string) {
  const reviewRequest = await buildReviewPrompt(input, ownerId);
  if (!reviewRequest.ok) return reviewRequest;

  const { feedback, model } = await requestAiFeedback(reviewRequest.prompt);
  const renderedText = renderFeedbackText(feedback);
  const review = await prisma.aiReview.create({
    data: {
      caseId: input.caseId,
      targetType: reviewRequest.targetType,
      targetId: input.targetId ?? null,
      reviewType: input.reviewType,
      promptVersion: "mvp-1",
      model,
      inputHash: stableHash(reviewRequest.prompt),
      feedback: stringifyStoredJson(feedback),
      renderedText,
    },
  });

  return { ok: true as const, review, feedback };
}

async function buildReviewPrompt(input: {
  caseId: string;
  reviewType: AiReviewType;
  targetId?: string;
}, ownerId?: string) {
  const bundle = await getCaseBundleForOwner(input.caseId, ownerId);
  if (!bundle) return { ok: false as const, status: 404, message: "Case not found." };

  const caseText = caseToPrompt(bundle);
  const initialRows = bundle.impressionRows.filter((row) => row.stage === "INITIAL");
  const finalRows = bundle.impressionRows.filter((row) => row.stage === "FINAL");
  const initialImpressionText = impressionTableToText(initialRows);
  const finalImpressionText = impressionTableToText(finalRows);
  const problemListText = problemListToText(bundle.problems);
  const diagnosticText = [
    "LAB TABLE",
    labTableToText(bundle.diagnosticData?.labTable),
    "IMAGE FINDINGS",
    bundle.diagnosticData?.imageFindingsText || "-",
    "PROCEDURE FINDINGS",
    bundle.diagnosticData?.procedureFindingsText || "-",
    "SUMMARY",
    bundle.diagnosticData?.summaryText || "-",
  ].join("\n");

  if (input.reviewType === "INITIAL_IMPRESSION") {
    if (!hasMeaningfulRows(initialRows, ["title", "evidence"])) {
      return draftFirst("Pre-test initial impression을 먼저 1개 이상 작성한 뒤 feedback을 요청하세요.");
    }
    return {
      ok: true as const,
      targetType: "impression_initial",
      prompt: reviewInitialImpressionPrompt({ caseText, initialImpressionText }),
    };
  }

  if (input.reviewType === "FINAL_IMPRESSION") {
    if (!hasMeaningfulRows(finalRows, ["title", "evidence"])) {
      return draftFirst("Post-test final impression을 먼저 1개 이상 작성한 뒤 feedback을 요청하세요.");
    }
    return {
      ok: true as const,
      targetType: "impression_final",
      prompt: reviewFinalImpressionPrompt({
        caseText,
        initialImpressionText,
        diagnosticText,
        finalImpressionText,
      }),
    };
  }

  if (input.reviewType === "PROBLEM_LIST") {
    if (!hasMeaningfulRows(bundle.problems, ["title", "evidence"])) {
      return draftFirst("Problem list를 먼저 1개 이상 작성한 뒤 feedback을 요청하세요.");
    }
    return {
      ok: true as const,
      targetType: "problem_list",
      prompt: reviewProblemListPrompt({ caseText, finalImpressionText, problemListText }),
    };
  }

  if (!input.targetId) {
    return { ok: false as const, status: 400, message: "SOAP review requires a progress note id." };
  }
  const note = await getProgressNoteForOwner(input.targetId, ownerId);
  if (!note) return { ok: false as const, status: 404, message: "Progress note not found." };
  if (!hasMeaningfulRows(note.problems, ["assessment"])) {
    return draftFirst("SOAP Assessment를 먼저 작성한 뒤 feedback을 요청하세요.");
  }

  return {
    ok: true as const,
    targetType: "soap_assessment",
    prompt: reviewSoapAssessmentPrompt({
      caseText,
      problemListText,
      progressNoteText: progressNoteToText(note.problems),
    }),
  };
}

function hasMeaningfulRows<T extends Record<string, unknown>>(rows: T[], fields: string[]) {
  return rows.some((row) =>
    fields.some((field) => String(row[field] ?? "").trim().length >= 8),
  );
}

function draftFirst(message: string) {
  return { ok: false as const, status: 422, message };
}

function renderFeedbackText(feedback: {
  summary: string;
  strengths: string[];
  concerns: string[];
  missingData: string[];
  revisionChecklist: string[];
  safetyPrivacyFlags: string[];
}) {
  return [
    feedback.summary,
    "Strengths",
    ...feedback.strengths.map((item) => `- ${item}`),
    "Concerns",
    ...feedback.concerns.map((item) => `- ${item}`),
    "Missing data",
    ...feedback.missingData.map((item) => `- ${item}`),
    "Revision checklist",
    ...feedback.revisionChecklist.map((item) => `- ${item}`),
    "Safety / privacy",
    ...feedback.safetyPrivacyFlags.map((item) => `- ${item}`),
  ].join("\n");
}
