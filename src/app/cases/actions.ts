"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCase,
  createProgressNote,
  replaceImpressions,
  replaceProblems,
  replaceTimeline,
  updateCaseMeta,
  updateProgressNote,
  upsertAdmission,
  upsertDiagnosticData,
} from "@/server/services/case-service";
import { defaultLabTable, type ImpressionStage, type Vitals } from "@/lib/types";
import { parseJsonField, toText } from "@/lib/utils";

export async function createCaseAction(formData: FormData) {
  const caseRecord = await createCase({
    title: toText(formData.get("title")),
    department: toText(formData.get("department")),
    summary: toText(formData.get("summary")),
    tags: splitTags(toText(formData.get("tags"))),
  });

  redirect(`/cases/${caseRecord.id}`);
}

export async function updateCaseAction(caseId: string, formData: FormData) {
  await updateCaseMeta(caseId, {
    title: toText(formData.get("title")),
    department: toText(formData.get("department")),
    status: toText(formData.get("status")),
    summary: toText(formData.get("summary")),
    tags: splitTags(toText(formData.get("tags"))),
  });
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

export async function saveTimelineAction(caseId: string, formData: FormData) {
  await replaceTimeline(caseId, parseJsonField(formData.get("entries"), []));
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

export async function saveAdmissionAction(caseId: string, formData: FormData) {
  await upsertAdmission(caseId, {
    cc: toText(formData.get("cc")),
    hpi: toText(formData.get("hpi")),
    pmh: toText(formData.get("pmh")),
    psh: toText(formData.get("psh")),
    medication: toText(formData.get("medication")),
    allergy: toText(formData.get("allergy")),
    familyHistory: toText(formData.get("familyHistory")),
    socialHistory: toText(formData.get("socialHistory")),
    alcoholHistory: toText(formData.get("alcoholHistory")),
    smokingHistory: toText(formData.get("smokingHistory")),
    ros: toText(formData.get("ros")),
    physicalExam: toText(formData.get("physicalExam")),
    initialVitals: parseVitals(formData),
    imageProcedureText: toText(formData.get("imageProcedureText")),
  });
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

export async function saveDiagnosticDataAction(caseId: string, formData: FormData) {
  await upsertDiagnosticData(caseId, {
    labTable: parseJsonField(formData.get("labTable"), defaultLabTable),
    imageFindingsText: toText(formData.get("imageFindingsText")),
    procedureFindingsText: toText(formData.get("procedureFindingsText")),
    summaryText: toText(formData.get("summaryText")),
  });
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

export async function saveImpressionsAction(
  caseId: string,
  stage: ImpressionStage,
  formData: FormData,
) {
  await replaceImpressions(caseId, stage, parseJsonField(formData.get("rows"), []));
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

export async function saveProblemsAction(caseId: string, formData: FormData) {
  await replaceProblems(caseId, parseJsonField(formData.get("rows"), []));
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

export async function createProgressNoteAction(caseId: string) {
  const note = await createProgressNote(caseId);
  redirect(`/cases/${caseId}/progress/${note.id}`);
}

export async function saveProgressNoteAction(
  caseId: string,
  noteId: string,
  formData: FormData,
) {
  await updateProgressNote(noteId, {
    date: toText(formData.get("date")),
    hospitalDay: toText(formData.get("hospitalDay")),
    vitals: parseVitals(formData),
    diet: toText(formData.get("diet")),
    io: toText(formData.get("io")),
    overnightEvent: toText(formData.get("overnightEvent")),
    drainTube: toText(formData.get("drainTube")),
    problems: parseJsonField(formData.get("problems"), []),
  });
  revalidateCase(caseId);
  redirectIfRequested(formData);
}

function parseVitals(formData: FormData): Vitals {
  return {
    bt: toText(formData.get("bt")),
    bp: toText(formData.get("bp")),
    pr: toText(formData.get("pr")),
    rr: toText(formData.get("rr")),
    spo2: toText(formData.get("spo2")),
  };
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function revalidateCase(caseId: string) {
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

function redirectIfRequested(formData: FormData) {
  const redirectTo = toText(formData.get("redirectTo"));
  if (redirectTo.startsWith("/cases")) {
    redirect(redirectTo);
  }
}
