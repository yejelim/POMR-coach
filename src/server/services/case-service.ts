import { prisma } from "@/server/db";
import {
  defaultLabTable,
  type ImpressionDraft,
  type ImpressionStage,
  type LabTable,
  type ProblemDraft,
  type ProgressProblemDraft,
  type TimelineDraft,
  type UploadedImage,
  type Vitals,
} from "@/lib/types";
import { stringifyStoredJson } from "@/lib/utils";

export async function listCases(query = "") {
  const q = query.trim();
  return prisma.case.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { department: { contains: q } },
            { summary: { contains: q } },
            { tags: { some: { name: { contains: q } } } },
          ],
        }
      : undefined,
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createCase(input: {
  title: string;
  department: string;
  summary: string;
  tags: string[];
}) {
  return prisma.case.create({
    data: {
      title: input.title || "Untitled anonymous case",
      department: input.department || "General",
      summary: input.summary,
      tags: { create: normalizeTags(input.tags).map((name) => ({ name })) },
      admissionNote: { create: {} },
      diagnosticData: { create: { labTable: stringifyStoredJson(defaultLabTable) } },
    },
  });
}

export async function getCaseBundle(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    include: {
      tags: { orderBy: { name: "asc" } },
      timelineEntries: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      admissionNote: true,
      diagnosticData: true,
      impressionRows: { orderBy: [{ stage: "asc" }, { rank: "asc" }] },
      problems: {
        include: { linkedImpressionRow: true },
        orderBy: [{ position: "asc" }, { priority: "asc" }],
      },
      progressNotes: {
        include: {
          problems: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
      aiReviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function updateCaseMeta(
  caseId: string,
  input: {
    title: string;
    department: string;
    status: string;
    summary: string;
    tags: string[];
  },
) {
  const tags = normalizeTags(input.tags);
  return prisma.$transaction(async (tx) => {
    await tx.caseTag.deleteMany({ where: { caseId } });
    return tx.case.update({
      where: { id: caseId },
      data: {
        title: input.title || "Untitled anonymous case",
        department: input.department || "General",
        status: input.status === "closed" ? "closed" : "active",
        summary: input.summary,
        tags: { create: tags.map((name) => ({ name })) },
      },
    });
  });
}

export async function replaceTimeline(caseId: string, rows: TimelineDraft[]) {
  const cleanRows = rows
    .map((row) => ({
      timepoint: row.timepoint.trim(),
      event: row.event.trim(),
      interpretation: row.interpretation.trim(),
      question: row.question.trim(),
    }))
    .filter((row) => Object.values(row).some(Boolean));

  return prisma.$transaction(async (tx) => {
    await tx.timelineEntry.deleteMany({ where: { caseId } });
    await tx.timelineEntry.createMany({
      data: cleanRows.map((row, position) => ({ ...row, caseId, position })),
    });
  });
}

export async function upsertAdmission(
  caseId: string,
  input: {
    cc: string;
    hpi: string;
    pmh: string;
    psh: string;
    medication: string;
    allergy: string;
    familyHistory: string;
    socialHistory: string;
    alcoholHistory: string;
    smokingHistory: string;
    ros: string;
    physicalExam: string;
    initialVitals: Vitals;
    imageProcedureText: string;
  },
) {
  return prisma.admissionNote.upsert({
    where: { caseId },
    create: { ...input, caseId, initialVitals: stringifyStoredJson(input.initialVitals) },
    update: { ...input, initialVitals: stringifyStoredJson(input.initialVitals) },
  });
}

export async function upsertDiagnosticData(
  caseId: string,
  input: {
    labTable: LabTable;
    imageAttachments: UploadedImage[];
    imageFindingsText: string;
    procedureFindingsText: string;
    summaryText: string;
  },
) {
  return prisma.diagnosticData.upsert({
    where: { caseId },
    create: {
      ...input,
      caseId,
      labTable: stringifyStoredJson(input.labTable),
      imageAttachments: stringifyStoredJson(input.imageAttachments),
    },
    update: {
      ...input,
      labTable: stringifyStoredJson(input.labTable),
      imageAttachments: stringifyStoredJson(input.imageAttachments),
    },
  });
}

export async function replaceImpressions(
  caseId: string,
  stage: ImpressionStage,
  rows: ImpressionDraft[],
) {
  const cleanRows = rows
    .map((row, index) => ({
      rank: Number.isFinite(row.rank) ? row.rank : index + 1,
      title: row.title.trim(),
      evidence: row.evidence.trim(),
      evidenceAgainst: row.evidenceAgainst.trim(),
      missingData: (row.missingData ?? "").trim(),
      dxPlan: row.dxPlan.trim(),
      txPlan: row.txPlan.trim(),
    }))
    .filter((row) => Object.values(row).some((value) => String(value).trim()));

  return prisma.$transaction(async (tx) => {
    await tx.impressionRow.deleteMany({ where: { caseId, stage } });
    await tx.impressionRow.createMany({
      data: cleanRows.map((row, index) => ({
        ...row,
        caseId,
        stage,
        rank: row.rank || index + 1,
      })),
    });
  });
}

export async function replaceProblems(caseId: string, rows: ProblemDraft[]) {
  const cleanRows = rows
    .map((row, index) => ({
      priority: Number.isFinite(row.priority) ? row.priority : index + 1,
      title: row.title.trim(),
      status: row.status || "active",
      evidence: row.evidence.trim(),
      linkedImpressionRowId: row.linkedImpressionRowId || null,
      notes: row.notes.trim(),
    }))
    .filter((row) => row.title || row.evidence || row.notes);

  return prisma.$transaction(async (tx) => {
    await tx.problem.deleteMany({ where: { caseId } });
    await tx.problem.createMany({
      data: cleanRows.map((row, position) => ({ ...row, caseId, position })),
    });
  });
}

export async function createProgressNote(caseId: string) {
  const problems = await prisma.problem.findMany({
    where: { caseId },
    orderBy: [{ position: "asc" }, { priority: "asc" }],
  });

  const today = new Date().toISOString().slice(0, 10);
  return prisma.progressNote.create({
    data: {
      caseId,
      date: today,
      problems: {
        create: problems.length
          ? problems.map((problem, position) => ({
              problemId: problem.id,
              titleSnapshot: problem.title,
              position,
            }))
          : [{ titleSnapshot: "New problem", position: 0 }],
      },
    },
  });
}

export async function getProgressNote(noteId: string) {
  return prisma.progressNote.findUnique({
    where: { id: noteId },
    include: {
      case: { include: { tags: true, problems: { orderBy: { position: "asc" } } } },
      problems: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });
}

export async function updateProgressNote(
  noteId: string,
  input: {
    date: string;
    hospitalDay: string;
    vitals: Vitals;
    diet: string;
    io: string;
    overnightEvent: string;
    drainTube: string;
    problems: ProgressProblemDraft[];
  },
) {
  const cleanProblems = input.problems
    .map((row) => ({
      problemId: row.problemId || null,
      titleSnapshot: (row.titleSnapshot ?? "").trim(),
      subjective: (row.subjective ?? "").trim(),
      objectiveItems: row.objectiveItems ?? [],
      objectiveImages: row.objectiveImages ?? [],
      objectivePe: (row.objectivePe ?? "").trim(),
      objectiveLab: (row.objectiveLab ?? "").trim(),
      objectiveImageProcedure: (row.objectiveImageProcedure ?? "").trim(),
      objectiveDrain: (row.objectiveDrain ?? "").trim(),
      assessment: (row.assessment ?? "").trim(),
      planItems: row.planItems ?? [],
      planDx: (row.planDx ?? "").trim(),
      planTx: (row.planTx ?? "").trim(),
      planMonitoring: (row.planMonitoring ?? "").trim(),
      planEducation: (row.planEducation ?? "").trim(),
    }))
    .filter(
      (row) =>
        row.titleSnapshot ||
        row.subjective ||
        row.assessment ||
        row.objectiveItems.some((item) => item.label.trim() || item.value.trim()) ||
        row.objectiveImages.some((image) => image.dataUrl || image.caption?.trim() || image.note?.trim()) ||
        row.planItems.some((item) => item.label.trim() || item.value.trim()) ||
        row.objectivePe ||
        row.objectiveLab ||
        row.objectiveImageProcedure ||
        row.objectiveDrain ||
        row.planDx ||
        row.planTx ||
        row.planMonitoring ||
        row.planEducation,
    )
    .map((row) => ({
      ...row,
      objectiveItems: stringifyStoredJson(row.objectiveItems),
      objectiveImages: stringifyStoredJson(row.objectiveImages),
      planItems: stringifyStoredJson(row.planItems),
    }));

  return prisma.$transaction(async (tx) => {
    await tx.progressNoteProblem.deleteMany({ where: { progressNoteId: noteId } });
    await tx.progressNote.update({
      where: { id: noteId },
      data: {
        date: input.date,
        hospitalDay: input.hospitalDay,
        vitals: stringifyStoredJson(input.vitals),
        diet: input.diet,
        io: input.io,
        overnightEvent: input.overnightEvent,
        drainTube: input.drainTube,
        problems: {
          create: cleanProblems.map((row, position) => ({ ...row, position })),
        },
      },
    });
  });
}

export async function listAiReviews(caseId: string, reviewType: string, targetId?: string) {
  return prisma.aiReview.findMany({
    where: { caseId, reviewType, ...(targetId ? { targetId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 32)),
    ),
  );
}
