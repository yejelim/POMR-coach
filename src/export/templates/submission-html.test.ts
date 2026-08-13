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

  it("renders ROS category notes with positives only", () => {
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
          ros: [
            "[General]",
            "- Fever (+): 38.2C",
            "- Chill (-)",
            "- Additional notes: symptoms started yesterday",
            "[GI]",
            "- Nausea (-)",
            "- Abdominal pain (+): RUQ pain",
          ].join("\n"),
          physicalExam: "",
          initialVitals: null,
          imageProcedureText: "",
        },
      }),
    );

    expect(html).toContain("Fever (+): 38.2C");
    expect(html).toContain("Notes: symptoms started yesterday");
    expect(html).toContain("Abdominal pain (+): RUQ pain");
    expect(html).not.toContain("Chill (-)");
    expect(html).not.toContain("Nausea (-)");
  });

  it("limits exported lab columns and uses the local footer wording", () => {
    const html = renderSubmissionHtml(
      baseCase({
        diagnosticData: {
          labTable: {
            schemaVersion: 1,
            columns: ["Date", "Test", "Unit", "Value", "Interpretation", "C6", "C7", "C8", "C9"],
            rows: [
              {
                Date: "2026-01-02",
                Test: "CRP",
                Unit: "mg/L",
                Value: "12",
                Interpretation: "elevated",
                C6: "6",
                C7: "7",
                C8: "8",
                C9: "9",
              },
            ],
            cellStyles: {},
          },
          imageAttachments: "[]",
          imageFindingsText: "",
          procedureFindingsText: "",
          summaryText: "",
        },
      }),
    );

    expect(html).toContain("AI 과의존을 예방하기 위한 POMR Coach로 직접 작성된 의무기록입니다.");
    expect(html).toContain("<th>C8</th>");
    expect(html).not.toContain("<th>C9</th>");
  });
});
