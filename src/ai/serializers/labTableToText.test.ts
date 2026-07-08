import { describe, expect, it } from "vitest";
import { labCellKey } from "@/lib/lab-table";
import { labTableToText, normalizeLabTable } from "./labTableToText";

describe("lab table serialization", () => {
  it("normalizes stored JSON strings", () => {
    const table = normalizeLabTable(
      JSON.stringify({
        schemaVersion: 1,
        columns: ["Test", "Admission", "Interpretation"],
        rows: [{ Test: "CRP", Admission: "12", Interpretation: "inflammatory marker elevated" }],
      }),
    );

    expect(table.columns).toEqual(["Test", "Admission", "Interpretation"]);
    expect(table.rows[0].CRP).toBeUndefined();
    expect(table.rows[0].Test).toBe("CRP");
  });

  it("renders table text in column order", () => {
    const text = labTableToText({
      schemaVersion: 1,
      columns: ["Test", "Interpretation"],
      rows: [{ Test: "amylase/lipase", Interpretation: "PEP보다 asymptomatic elevation 가능" }],
    });

    expect(text).toContain("Test | Interpretation");
    expect(text).toContain("amylase/lipase | PEP보다 asymptomatic elevation 가능");
  });

  it("normalizes supported cell styles without adding them to prompt text", () => {
    const highKey = labCellKey(0, "Admission");
    const lowKey = labCellKey(0, "Post D1");
    const table = normalizeLabTable({
      schemaVersion: 1,
      columns: ["Test", "Admission", "Post D1"],
      rows: [{ Test: "Hb", Admission: "18", "Post D1": "8" }],
      cellStyles: {
        [highKey]: "high",
        [lowKey]: "low",
        [labCellKey(2, "Admission")]: "high",
        [labCellKey(0, "Unknown")]: "low",
        [labCellKey(0, "Test")]: "normal",
      },
    });

    expect(table.cellStyles).toEqual({ [highKey]: "high", [lowKey]: "low" });
    expect(labTableToText(table)).toContain("Hb | 18 | 8");
    expect(labTableToText(table)).not.toContain("high");
  });
});
