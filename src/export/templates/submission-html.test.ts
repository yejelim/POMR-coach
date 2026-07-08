import { describe, expect, it } from "vitest";
import { labCellKey } from "@/lib/lab-table";
import { renderSubmissionHtml } from "./submission-html";

function baseCase(overrides: Record<string, unknown> = {}) {
  return {
    id: "case-export-test",
    ownerId: null,
    title: "Export test case",
    department: "GI",
    status: "active",
    summary: "",
    templateKey: "generic",
    createdAt: new Date("2026-01-02T03:04:00Z"),
    updatedAt: new Date("2026-01-02T03:04:00Z"),
    admissionNote: null,
    diagnosticData: null,
    impressionRows: [],
    problems: [],
    progressNotes: [],
    tags: [],
    timelineEntries: [],
    aiReviews: [],
    ...overrides,
  } as Parameters<typeof renderSubmissionHtml>[0];
}

describe("renderSubmissionHtml", () => {
  it("renders clinical highlight markup in PE and SOAP content", () => {
    const html = renderSubmissionHtml(
      baseCase({
        admissionNote: {
          cc: "",
          hpi: "",
          pmh: "",
          psh: "",
          medication: "",
          allergy: "",
          familyHistory: "",
          socialHistory: "",
          alcoholHistory: "",
          smokingHistory: "",
          ros: "",
          physicalExam: "Abdomen ==tenderness==, **guarding**",
          initialVitals: null,
          imageProcedureText: "",
        },
        progressNotes: [
          {
            date: "2026-01-02",
            hospitalDay: "2",
            vitals: null,
            diet: "",
            io: "",
            overnightEvent: "",
            drainTube: "",
            createdAt: new Date("2026-01-02T03:04:00Z"),
            problems: [
              {
                titleSnapshot: "Abdominal pain",
                progressStatus: "active",
                subjective: "Pain ==improved==",
                assessment: "**stable**",
                objectiveItems: [{ id: "o1", label: "PE", value: "Abdomen ==soft==" }],
                objectiveImages: "[]",
                objectivePe: "",
                objectiveLab: "",
                objectiveImageProcedure: "",
                objectiveDrain: "",
                planItems: [{ id: "p1", label: "Tx", value: "Continue **hydration**" }],
                planDx: "",
                planTx: "",
                planMonitoring: "",
                planEducation: "",
              },
            ],
          },
        ],
      }),
    );

    expect(html).toContain('<mark class="text-highlight">tenderness</mark>');
    expect(html).toContain("<strong>guarding</strong>");
    expect(html).toContain('<mark class="text-highlight">improved</mark>');
    expect(html).toContain('<mark class="text-highlight">soft</mark>');
    expect(html).toContain("<strong>hydration</strong>");
  });

  it("omits empty impression and problem list columns", () => {
    const html = renderSubmissionHtml(
      baseCase({
        impressionRows: [
          {
            stage: "INITIAL",
            rank: 1,
            title: "Biliary obstruction",
            evidence: "RUQ pain",
            evidenceAgainst: "",
            missingData: "",
            dxPlan: "",
            txPlan: "",
          },
        ],
        problems: [
          {
            priority: 1,
            title: "RUQ pain",
            status: "active",
            evidence: "Pain history",
            notes: "",
          },
        ],
      }),
    );

    expect(html).toContain("<th>Evidence</th>");
    expect(html).not.toContain("<th>Against / uncertainty</th>");
    expect(html).not.toContain("<th>Missing data</th>");
    expect(html).not.toContain("<th>Dx plan</th>");
    expect(html).not.toContain("<th>Tx plan</th>");
    expect(html).not.toContain("<th>Notes</th>");
  });

  it("renders lab cell high and low styles for export", () => {
    const html = renderSubmissionHtml(
      baseCase({
        diagnosticData: {
          labTable: {
            schemaVersion: 1,
            columns: ["Test", "Admission", "Post D1"],
            rows: [{ Test: "Hb", Admission: "18", "Post D1": "8" }],
            cellStyles: {
              [labCellKey(0, "Admission")]: "high",
              [labCellKey(0, "Post D1")]: "low",
            },
          },
          imageAttachments: "[]",
          imageFindingsText: "",
          procedureFindingsText: "",
          summaryText: "",
        },
      }),
    );

    expect(html).toContain('class="lab-cell mono lab-cell-high"');
    expect(html).toContain('class="lab-cell mono lab-cell-low"');
  });
});
