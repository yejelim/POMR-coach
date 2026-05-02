import fs from "node:fs";
import path from "node:path";
import { normalizeLabTable } from "@/ai/serializers/labTableToText";

type CaseBundle = NonNullable<Awaited<ReturnType<typeof import("@/server/services/case-service").getCaseBundle>>>;

export function renderSubmissionHtml(caseRecord: CaseBundle) {
  const admission = caseRecord.admissionNote;
  const data = caseRecord.diagnosticData;
  const initialRows = caseRecord.impressionRows.filter((row) => row.stage === "INITIAL");
  const finalRows = caseRecord.impressionRows.filter((row) => row.stage === "FINAL");
  const labTable = normalizeLabTable(data?.labTable);
  const logoDataUri = getLogoDataUri();

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(caseRecord.title)} - POMR Coach Submission</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body {
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", Arial, sans-serif;
      color: #0f172a;
      font-size: 12px;
      line-height: 1.55;
    }
    h1 { font-size: 21px; margin: 0 0 4px; }
    h2 { border-bottom: 1px solid #0f766e; color: #0f172a; font-size: 15px; margin: 22px 0 8px; padding-bottom: 4px; }
    h3 { font-size: 13px; margin: 14px 0 4px; }
    p { margin: 0 0 8px; white-space: pre-wrap; }
    table { border-collapse: collapse; margin: 8px 0 14px; width: 100%; }
    th, td { border: 1px solid #e2e8f0; padding: 5px; text-align: left; vertical-align: top; }
    th { background: #ccfbf1; color: #134e4a; font-weight: 700; }
    .pdf-header { align-items: center; border-bottom: 1px solid #e2e8f0; display: flex; gap: 10px; margin-bottom: 16px; padding-bottom: 10px; }
    .pdf-logo { height: 30px; object-fit: contain; width: 30px; }
    .brand { color: #0f766e; font-size: 13px; font-weight: 700; margin: 0; }
    .tagline { color: #475569; font-size: 10px; margin: 0; }
    .meta { color: #475569; margin-bottom: 14px; }
    .footer { border-top: 1px solid #cbd5e1; color: #64748b; font-size: 10px; margin-top: 28px; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="pdf-header">
    ${logoDataUri ? `<img class="pdf-logo" src="${logoDataUri}" alt="POMR Coach" />` : ""}
    <div>
      <p class="brand">POMR Coach</p>
      <p class="tagline">Write first. Reflect with AI. Learn from every case.</p>
    </div>
  </div>
  <h1>${escapeHtml(caseRecord.title)}</h1>
  <p class="meta">Department: ${escapeHtml(caseRecord.department)} | Status: ${escapeHtml(caseRecord.status)}</p>
  ${section("Admission Note", [
    field("CC", admission?.cc),
    field("HPI", admission?.hpi),
    field("PMH", admission?.pmh),
    field("PSH", admission?.psh),
    field("Medication", admission?.medication),
    field("Allergy", admission?.allergy),
    field("Family history", admission?.familyHistory),
    field("Social history", admission?.socialHistory),
    field("ROS", admission?.ros),
    field("Physical examination", admission?.physicalExam),
    field("Initial vital signs", vitalsToText(admission?.initialVitals)),
    field("Image/procedure text findings", admission?.imageProcedureText),
  ])}
  ${impressionTable("Pre-test Initial Impression", initialRows, true)}
  ${section("Lab / Image / Procedure Summary", [
    labTableHtml(labTable),
    field("Image findings", data?.imageFindingsText),
    field("Procedure findings", data?.procedureFindingsText),
    field("Summary", data?.summaryText),
  ])}
  ${impressionTable("Post-test Final Impression", finalRows, false)}
  ${problemList(caseRecord.problems)}
  ${progressNotes(caseRecord.progressNotes)}
  <div class="footer">Educational POMR practice submission. De-identified local export; AI feedback and scratchpad timeline are excluded.</div>
</body>
</html>`;
}

function getLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), "public", "POMR_coach_logo.png");
    const logo = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logo.toString("base64")}`;
  } catch {
    return "";
  }
}

function section(title: string, parts: string[]) {
  return `<section><h2>${escapeHtml(title)}</h2>${parts.join("\n")}</section>`;
}

function field(label: string, value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return `<h3>${escapeHtml(label)}</h3><p>-</p>`;
  return `<h3>${escapeHtml(label)}</h3><p>${escapeHtml(text)}</p>`;
}

function impressionTable(title: string, rows: CaseBundle["impressionRows"], includeMissing: boolean) {
  return `<section><h2>${escapeHtml(title)}</h2><table><thead><tr>
    <th>Rank</th><th>Impression</th><th>Evidence</th><th>Against / uncertainty</th>
    ${includeMissing ? "<th>Missing Data</th>" : ""}<th>Dx Plan</th><th>Tx Plan</th>
  </tr></thead><tbody>
    ${
      rows.length
        ? rows
            .map(
              (row) => `<tr><td>${row.rank}</td><td>${escapeHtml(row.title)}</td><td>${escapeHtml(row.evidence)}</td><td>${escapeHtml(row.evidenceAgainst)}</td>${includeMissing ? `<td>${escapeHtml(row.missingData)}</td>` : ""}<td>${escapeHtml(row.dxPlan)}</td><td>${escapeHtml(row.txPlan)}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="${includeMissing ? 7 : 6}">-</td></tr>`
    }
  </tbody></table></section>`;
}

function labTableHtml(table: ReturnType<typeof normalizeLabTable>) {
  return `<h3>Lab table</h3><table><thead><tr>${table.columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join("")}</tr></thead><tbody>${
    table.rows.length
      ? table.rows
          .map(
            (row) =>
              `<tr>${table.columns.map((column) => `<td>${escapeHtml(row[column] ?? "")}</td>`).join("")}</tr>`,
          )
          .join("")
      : `<tr><td colspan="${table.columns.length}">-</td></tr>`
  }</tbody></table>`;
}

function problemList(problems: CaseBundle["problems"]) {
  return `<section><h2>Problem List</h2><table><thead><tr><th>Priority</th><th>Problem</th><th>Status</th><th>Evidence</th><th>Notes</th></tr></thead><tbody>${
    problems.length
      ? problems
          .map(
            (problem) =>
              `<tr><td>${problem.priority}</td><td>${escapeHtml(problem.title)}</td><td>${escapeHtml(problem.status)}</td><td>${escapeHtml(problem.evidence)}</td><td>${escapeHtml(problem.notes)}</td></tr>`,
          )
          .join("")
      : "<tr><td colspan=\"5\">-</td></tr>"
  }</tbody></table></section>`;
}

function progressNotes(notes: CaseBundle["progressNotes"]) {
  return `<section><h2>Progress Notes</h2>${
    notes.length
      ? notes
          .map(
            (note) => `<h3>${escapeHtml(note.date || "Undated")} ${escapeHtml(note.hospitalDay || "")}</h3>
        ${field("Vitals", vitalsToText(note.vitals))}
        ${field("Diet", note.diet)}
        ${field("I/O", note.io)}
        ${field("Overnight event", note.overnightEvent)}
        ${field("Drain/tube", note.drainTube)}
        ${note.problems
          .map(
            (problem, index) => `<h3>#${index + 1} ${escapeHtml(problem.titleSnapshot)}</h3>
          ${field("S", problem.subjective)}
          ${field("O - PE", problem.objectivePe)}
          ${field("O - Lab", problem.objectiveLab)}
          ${field("O - Image/Procedure", problem.objectiveImageProcedure)}
          ${field("O - Drain", problem.objectiveDrain)}
          ${field("A", problem.assessment)}
          ${field("P - Dx", problem.planDx)}
          ${field("P - Tx", problem.planTx)}
          ${field("P - Monitoring", problem.planMonitoring)}
          ${field("P - Education", problem.planEducation)}`,
          )
          .join("")}`,
          )
          .join("")
      : "<p>-</p>"
  }</section>`;
}

function vitalsToText(value: unknown) {
  if (typeof value === "string") {
    try {
      return vitalsToText(JSON.parse(value));
    } catch {
      return "";
    }
  }
  if (!value || typeof value !== "object") return "";
  const vitals = value as Record<string, string>;
  return [
    vitals.bt ? `BT ${vitals.bt}` : "",
    vitals.bp ? `BP ${vitals.bp}` : "",
    vitals.pr ? `PR ${vitals.pr}` : "",
    vitals.rr ? `RR ${vitals.rr}` : "",
    vitals.spo2 ? `SpO2 ${vitals.spo2}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
