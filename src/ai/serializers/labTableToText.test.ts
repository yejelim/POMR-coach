import { describe, expect, it } from "vitest";
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
});
