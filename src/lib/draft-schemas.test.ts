import { describe, expect, it } from "vitest";
import {
  impressionDraftSchema,
  parseDraftArray,
  problemDraftSchema,
  progressProblemDraftSchema,
} from "@/lib/draft-schemas";

describe("parseDraftArray", () => {
  it("returns [] for null, non-array JSON, and invalid JSON", () => {
    expect(parseDraftArray(null, impressionDraftSchema)).toEqual([]);
    expect(parseDraftArray("{}", impressionDraftSchema)).toEqual([]);
    expect(parseDraftArray("not json", impressionDraftSchema)).toEqual([]);
  });

  it("drops non-object rows but keeps valid rows with field coercion", () => {
    const value = JSON.stringify([
      { title: "A", rank: "2" }, // numeric string coerced
      "garbage", // dropped
      123, // dropped
      { title: "B" }, // missing fields filled by defaults
    ]);
    const rows = parseDraftArray(value, impressionDraftSchema);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ title: "A", rank: 2 });
    expect(rows[1]).toMatchObject({ title: "B", evidence: "" });
  });

  it("coerces an invalid problem status to active and empty id to undefined", () => {
    const rows = parseDraftArray(
      JSON.stringify([{ title: "P", status: "weird", id: "" }]),
      problemDraftSchema,
    );
    expect(rows[0].status).toBe("active");
    expect(rows[0].id).toBeUndefined();
  });

  it("defaults malformed progress-note nested arrays to []", () => {
    const rows = parseDraftArray(
      JSON.stringify([{ subjective: "s", objectiveItems: "not-an-array" }]),
      progressProblemDraftSchema,
    );
    expect(rows[0].objectiveItems).toEqual([]);
    expect(rows[0].assessment).toBe("");
  });
});
