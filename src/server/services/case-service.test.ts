import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import {
  createCase,
  deleteCaseForOwner,
  getCaseBundleForOwner,
  listCasesForOwner,
  replaceProblems,
  updateCaseMeta,
} from "@/server/services/case-service";

// Unique per run so leftover rows from a crashed run never cause collisions.
const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const OWNER_A = `owner-a-${suffix}`;
const OWNER_B = `owner-b-${suffix}`;

let caseId: string;

beforeAll(async () => {
  await prisma.user.create({ data: { id: OWNER_A } });
  await prisma.user.create({ data: { id: OWNER_B } });
  const created = await createCase({
    title: "Owner A case",
    department: "IM",
    summary: "",
    tags: [],
    ownerId: OWNER_A,
  });
  caseId = created.id;
});

afterAll(async () => {
  await prisma.case.deleteMany({ where: { ownerId: { in: [OWNER_A, OWNER_B] } } });
  await prisma.user.deleteMany({ where: { id: { in: [OWNER_A, OWNER_B] } } });
});

describe("case-service owner isolation", () => {
  it("lists a case only for its owner", async () => {
    const forA = await listCasesForOwner("", OWNER_A);
    const forB = await listCasesForOwner("", OWNER_B);
    expect(forA.map((c) => c.id)).toContain(caseId);
    expect(forB.map((c) => c.id)).not.toContain(caseId);
  });

  it("returns the bundle for the owner and null for a non-owner", async () => {
    expect(await getCaseBundleForOwner(caseId, OWNER_A)).not.toBeNull();
    expect(await getCaseBundleForOwner(caseId, OWNER_B)).toBeNull();
  });

  it("rejects metadata updates from a non-owner", async () => {
    await expect(
      updateCaseMeta(
        caseId,
        { title: "hijacked", department: "X", status: "active", summary: "", tags: [] },
        OWNER_B,
      ),
    ).rejects.toThrow();
    // The owner's title must be unchanged.
    const bundle = await getCaseBundleForOwner(caseId, OWNER_A);
    expect(bundle?.title).toBe("Owner A case");
  });

  it("rejects collection writes from a non-owner", async () => {
    await expect(
      replaceProblems(
        caseId,
        [
          {
            priority: 1,
            title: "intruder problem",
            status: "active",
            evidence: "",
            notes: "",
          },
        ],
        OWNER_B,
      ),
    ).rejects.toThrow();
    const bundle = await getCaseBundleForOwner(caseId, OWNER_A);
    expect(bundle?.problems).toHaveLength(0);
  });

  it("allows the owner to write and read back their data", async () => {
    await replaceProblems(
      caseId,
      [{ priority: 1, title: "real problem", status: "active", evidence: "ev", notes: "" }],
      OWNER_A,
    );
    const bundle = await getCaseBundleForOwner(caseId, OWNER_A);
    expect(bundle?.problems.map((p) => p.title)).toEqual(["real problem"]);
  });

  it("rejects deletion from a non-owner but allows the owner", async () => {
    await expect(deleteCaseForOwner(caseId, OWNER_B)).rejects.toThrow();
    expect(await getCaseBundleForOwner(caseId, OWNER_A)).not.toBeNull();
    await deleteCaseForOwner(caseId, OWNER_A);
    expect(await getCaseBundleForOwner(caseId, OWNER_A)).toBeNull();
  });
});
