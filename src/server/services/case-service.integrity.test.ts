import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import {
  createCase,
  createProgressNote,
  getCaseBundleForOwner,
  getProgressNoteForOwner,
  replaceImpressions,
  replaceProblems,
  updateProgressNote,
} from "@/server/services/case-service";
import type { ProgressProblemDraft } from "@/lib/types";

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const OWNER = `integrity-owner-${suffix}`;

function soapDraft(overrides: Partial<ProgressProblemDraft> = {}): ProgressProblemDraft {
  return {
    problemId: "",
    titleSnapshot: "",
    subjective: "s",
    objectivePe: "",
    objectiveLab: "",
    objectiveImageProcedure: "",
    objectiveDrain: "",
    assessment: "a",
    planDx: "",
    planTx: "",
    planMonitoring: "",
    planEducation: "",
    ...overrides,
  };
}

beforeAll(async () => {
  await prisma.user.create({ data: { id: OWNER } });
});

afterAll(async () => {
  await prisma.case.deleteMany({ where: { ownerId: OWNER } });
  await prisma.user.deleteMany({ where: { id: OWNER } });
});

describe("collection saves preserve ids and FK links", () => {
  it("keeps impression ids across re-save so problem links survive", async () => {
    const c = await createCase({ title: "I", department: "IM", summary: "", tags: [], ownerId: OWNER });

    await replaceImpressions(
      c.id,
      "FINAL",
      [{ rank: 1, title: "Imp1", evidence: "e", evidenceAgainst: "", dxPlan: "", txPlan: "" }],
      OWNER,
    );
    let bundle = await getCaseBundleForOwner(c.id, OWNER);
    const impId = bundle!.impressionRows.find((r) => r.stage === "FINAL")!.id;

    await replaceProblems(
      c.id,
      [{ priority: 1, title: "P1", status: "active", evidence: "", linkedImpressionRowId: impId, notes: "" }],
      OWNER,
    );
    bundle = await getCaseBundleForOwner(c.id, OWNER);
    const probId = bundle!.problems[0].id;
    expect(bundle!.problems[0].linkedImpressionRowId).toBe(impId);

    // Re-save impressions as the editor would (carrying the existing id) with an edit.
    await replaceImpressions(
      c.id,
      "FINAL",
      [{ id: impId, rank: 1, title: "Imp1 edited", evidence: "e", evidenceAgainst: "", dxPlan: "", txPlan: "" }],
      OWNER,
    );
    bundle = await getCaseBundleForOwner(c.id, OWNER);
    const finalRows = bundle!.impressionRows.filter((r) => r.stage === "FINAL");
    expect(finalRows).toHaveLength(1);
    expect(finalRows[0].id).toBe(impId);
    expect(finalRows[0].title).toBe("Imp1 edited");
    // The problem -> impression link is intact.
    expect(bundle!.problems[0].id).toBe(probId);
    expect(bundle!.problems[0].linkedImpressionRowId).toBe(impId);
  });

  it("keeps problem ids across re-save so progress-note SOAP links survive", async () => {
    const c = await createCase({ title: "P", department: "IM", summary: "", tags: [], ownerId: OWNER });
    await replaceProblems(
      c.id,
      [{ priority: 1, title: "P1", status: "active", evidence: "", notes: "" }],
      OWNER,
    );
    let bundle = await getCaseBundleForOwner(c.id, OWNER);
    const probId = bundle!.problems[0].id;

    // Snapshot the problem into a new progress note.
    const note = await createProgressNote(c.id, OWNER);
    let fetched = await getProgressNoteForOwner(note.id, OWNER);
    expect(fetched!.problems.some((p) => p.problemId === probId)).toBe(true);

    // Re-save the problem list (edited) — the id must be preserved.
    await replaceProblems(
      c.id,
      [{ id: probId, priority: 1, title: "P1 edited", status: "improving", evidence: "", notes: "" }],
      OWNER,
    );
    bundle = await getCaseBundleForOwner(c.id, OWNER);
    expect(bundle!.problems[0].id).toBe(probId);

    // The progress note's SOAP entry is still linked (not nulled).
    fetched = await getProgressNoteForOwner(note.id, OWNER);
    expect(fetched!.problems.some((p) => p.problemId === probId)).toBe(true);
  });

  it("coerces unknown/foreign problemId to null in updateProgressNote", async () => {
    const c = await createCase({ title: "S", department: "IM", summary: "", tags: [], ownerId: OWNER });
    await replaceProblems(
      c.id,
      [{ priority: 1, title: "P1", status: "active", evidence: "", notes: "" }],
      OWNER,
    );
    const bundle = await getCaseBundleForOwner(c.id, OWNER);
    const probId = bundle!.problems[0].id;
    const note = await createProgressNote(c.id, OWNER);

    const baseInput = {
      date: "2026-01-01",
      hospitalDay: "",
      vitals: {},
      diet: "",
      io: "",
      overnightEvent: "",
      drainTube: "",
    };

    // Foreign id -> coerced to null, save still succeeds.
    await updateProgressNote(
      note.id,
      { ...baseInput, problems: [soapDraft({ problemId: "does-not-exist", titleSnapshot: "X" })] },
      OWNER,
    );
    let after = await getProgressNoteForOwner(note.id, OWNER);
    expect(after!.problems).toHaveLength(1);
    expect(after!.problems[0].problemId).toBeNull();

    // Valid id -> preserved.
    await updateProgressNote(
      note.id,
      { ...baseInput, problems: [soapDraft({ problemId: probId, titleSnapshot: "P1" })] },
      OWNER,
    );
    after = await getProgressNoteForOwner(note.id, OWNER);
    expect(after!.problems[0].problemId).toBe(probId);
  });
});
