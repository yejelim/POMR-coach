import fs from "node:fs";
import path from "node:path";
import { normalizeLabTable } from "@/ai/serializers/labTableToText";
import { isValidImageDataUrl } from "@/lib/image-limits";
import { objectiveItemsFromProblem, planItemsFromProblem } from "@/lib/soap-fields";
import type { UploadedImage } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";

type CaseBundle = NonNullable<Awaited<ReturnType<typeof import("@/server/services/case-service").getCaseBundle>>>;

export type SubmissionHtmlOptions = {
  includeBranding?: boolean;
  includeFooter?: boolean;
};

export function renderSubmissionHtml(caseRecord: CaseBundle, options: SubmissionHtmlOptions = {}) {
  const admission = caseRecord.admissionNote;
  const data = caseRecord.diagnosticData;
  const initialRows = caseRecord.impressionRows.filter((row) => row.stage === "INITIAL");
  const finalRows = caseRecord.impressionRows.filter((row) => row.stage === "FINAL");
  const labTable = normalizeLabTable(data?.labTable);
  const diagnosticImages = parseStoredJson<UploadedImage[]>(data?.imageAttachments, []);
  const includeBranding = options.includeBranding ?? true;
  const includeFooter = options.includeFooter ?? true;
  const logoDataUri = includeBranding ? getLogoDataUri() : "";

  // Build each clinical section as a raw inner-HTML string (empty when it has no
  // meaningful content), then number ONLY the survivors. This keeps section
  // numbers gap-free even when sparse cases skip whole sections.
  const sectionBodies: Array<{ title: string; subtitle?: string; body: string }> = [
    {
      title: "Admission Note",
      body: definitionGrid([
        defRow("CC", admission?.cc),
        defRow("HPI", admission?.hpi),
        defRow("PMH", admission?.pmh),
        defRow("PSH", admission?.psh),
        defRow("Medication", admission?.medication),
        defRow("Allergy", admission?.allergy),
        defRow("Family history", admission?.familyHistory),
        defRow("Social history", admission?.socialHistory),
        defRow("Alcohol history", admission?.alcoholHistory),
        defRow("Smoking history", admission?.smokingHistory),
        defRow("ROS", positiveRosToText(admission?.ros)),
        defRowRich("Physical examination", admission?.physicalExam),
        defRowRaw("Initial vital signs", vitalsHtml(admission?.initialVitals)),
        defRow("Image/procedure text findings", admission?.imageProcedureText),
      ]),
    },
    {
      title: "Pre-test Initial Impression",
      body: impressionTableBody(initialRows, true),
    },
    {
      title: "Lab / Image / Procedure Summary",
      body: blocks([
        labTableHtml(labTable),
        renderImages("Uploaded images", diagnosticImages),
        subBlock("Image findings", data?.imageFindingsText),
        subBlock("Procedure findings", data?.procedureFindingsText),
        subBlock("Summary", data?.summaryText),
      ]),
    },
    {
      title: "Post-test Final Impression",
      body: impressionTableBody(finalRows, false),
    },
    {
      title: "Problem List",
      body: problemListBody(caseRecord.problems),
    },
    {
      title: "Progress Notes",
      body: progressNotesBody(caseRecord.progressNotes),
    },
  ];

  const renderedSections = sectionBodies
    .filter((entry) => entry.body.trim())
    .map((entry, index) => renderSection(index + 1, entry.title, entry.subtitle, entry.body))
    .join("\n");

  const updatedAt = formatTimestamp(caseRecord.updatedAt);
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(caseRecord.title)} - POMR Coach Submission</title>
  <style>${baseStyles()}</style>
</head>
<body>
  <table class="page-frame">
    <thead><tr><td>${runningHeader({ includeBranding, logoDataUri, department: caseRecord.department })}</td></tr></thead>
    ${includeFooter ? `<tfoot><tr><td>${runningFooter({ includeBranding, updatedAt })}</td></tr></tfoot>` : ""}
    <tbody><tr><td>
      <main class="doc">
        ${pageTitleBlock(caseRecord.title)}
        ${infoBlock({
          department: caseRecord.department,
          updatedAt,
          summary: caseRecord.summary,
        })}
        ${renderedSections}
      </main>
    </td></tr></tbody>
  </table>
</body>
</html>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Logo embedding (only when branding is on)
 * ────────────────────────────────────────────────────────────────────────── */

function getLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), "public", "POMR_coach_logo.png");
    const logo = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logo.toString("base64")}`;
  } catch {
    return "";
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * Page chrome: letterhead, info block, footer
 * ────────────────────────────────────────────────────────────────────────── */

// A slim masthead that REPEATS on every printed page (position: fixed sits in the
// reserved @page top margin), so any single page stays identifiable on its own.
function runningHeader(input: {
  includeBranding: boolean;
  logoDataUri: string;
  department: string;
}) {
  const { includeBranding, logoDataUri, department } = input;
  const logo =
    includeBranding && logoDataUri
      ? `<img class="rh-logo" src="${escapeAttribute(logoDataUri)}" alt="" />`
      : "";
  const ident = escapeHtml(department);
  return `<div class="running-header">
    <div class="rh-left">${logo}<span class="rh-doctype">Problem-Oriented Medical Record</span></div>
    <div class="rh-ident">${ident}</div>
  </div>`;
}

// Page-1 title block (the full case title appears once, beneath the masthead).
function pageTitleBlock(title: string) {
  return `<div class="page-title"><h1 class="pt-title">${escapeHtml(title)}</h1></div>`;
}

function infoBlock(input: {
  department: string;
  updatedAt: string;
  summary: string;
}) {
  const cells = [
    infoCell("Department", escapeHtml(input.department) || "&mdash;"),
    infoCell("Last update", escapeHtml(input.updatedAt) || "&mdash;"),
  ].join("");

  const summaryRow = hasText(input.summary)
    ? `<div class="info-aux info-summary">
        <span class="info-aux-label">Summary</span>
        <span class="info-aux-value">${escapeHtml(String(input.summary).trim())}</span>
      </div>`
    : "";

  return `<section class="info-block">
    <div class="info-grid">${cells}</div>
    ${summaryRow}
  </section>`;
}

function infoCell(label: string, valueHtml: string) {
  return `<div class="info-cell">
    <span class="info-label">${escapeHtml(label)}</span>
    <span class="info-value">${valueHtml}</span>
  </div>`;
}

// A slim footer that REPEATS on every printed page (fixed, in the bottom margin).
function runningFooter(input: { includeBranding: boolean; updatedAt: string }) {
  const { includeBranding, updatedAt } = input;
  const brand = includeBranding ? " &middot; POMR Coach" : "";
  return `<div class="running-footer">
    <span class="rf-note">학습용 자료 &middot; 실제 진료기록 아님 &middot; Educational use only &middot; not a clinical record${brand}</span>
    <span class="rf-stamp">Last update ${escapeHtml(updatedAt)}</span>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Section frame + numbering
 * ────────────────────────────────────────────────────────────────────────── */

function renderSection(number: number, title: string, subtitle: string | undefined, body: string) {
  return `<section class="clin-section">
    <h2 class="section-head">
      <span class="section-num">${number}</span>
      <span class="section-title">${escapeHtml(title)}</span>
      ${subtitle ? `<span class="section-sub">${escapeHtml(subtitle)}</span>` : ""}
    </h2>
    <div class="section-body">${body}</div>
  </section>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Generic content helpers (presentation)
 * ────────────────────────────────────────────────────────────────────────── */

// Join non-empty block strings, keeping empty-section skipping intact upstream.
function blocks(parts: string[]) {
  return parts.filter((part) => part.trim()).join("\n");
}

// A loose labeled block used inside the Lab/Image/Procedure summary section.
function subBlock(label: string, value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return `<div class="sub-block">
    <h3 class="sub-label">${escapeHtml(label)}</h3>
    <p class="sub-text">${escapeHtml(text)}</p>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Admission Note: two-column definition grid
 * ────────────────────────────────────────────────────────────────────────── */

function definitionGrid(rows: string[]) {
  const meaningful = rows.filter((row) => row.trim());
  if (!meaningful.length) return "";
  return `<div class="def-grid">${meaningful.join("")}</div>`;
}

function defRow(label: string, value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return defRowRaw(label, `<span class="def-text">${escapeHtml(text)}</span>`);
}

function defRowRich(label: string, value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return defRowRaw(label, `<span class="def-text">${formatClinicalMarkup(text)}</span>`);
}

function defRowRaw(label: string, innerHtml: string) {
  if (!innerHtml.trim()) return "";
  return `<div class="def-row">
    <div class="def-label">${escapeHtml(label)}</div>
    <div class="def-value">${innerHtml}</div>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * ROS (positives-only grouping) — unchanged logic
 * ────────────────────────────────────────────────────────────────────────── */

function positiveRosToText(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const sections: string[] = [];
  let currentCategory = "";
  let currentPositiveLines: string[] = [];
  let inAdditionalNotes = false;
  let sawStructuredLine = false;
  const additionalLines: string[] = [];

  function flushCurrentCategory() {
    if (currentCategory && currentPositiveLines.length) {
      sections.push(`[${currentCategory}]\n${currentPositiveLines.join("\n")}`);
    }
    currentPositiveLines = [];
  }

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const categoryMatch = trimmed.match(/^\[(.+)]$/);
    if (categoryMatch) {
      flushCurrentCategory();
      currentCategory = categoryMatch[1];
      inAdditionalNotes = currentCategory.toLowerCase() === "additional notes";
      sawStructuredLine = true;
      continue;
    }

    if (inAdditionalNotes) {
      additionalLines.push(trimmed);
      continue;
    }

    const itemMatch = trimmed.match(/^- (.+?) \(([+-])\)(?:: (.*))?$/);
    if (itemMatch) {
      sawStructuredLine = true;
      const [, item, sign, comment = ""] = itemMatch;
      if (sign === "+") {
        currentPositiveLines.push(`- ${item} (+)${comment.trim() ? `: ${comment.trim()}` : ""}`);
      }
      continue;
    }

    additionalLines.push(trimmed);
  }

  flushCurrentCategory();

  if (!sawStructuredLine) return text;
  if (additionalLines.length) {
    sections.push(`[Additional notes]\n${additionalLines.join("\n")}`);
  }

  return sections.join("\n").trim();
}

/* ──────────────────────────────────────────────────────────────────────────
 * Clinical markup (** bold **, == highlight ==) — unchanged behavior
 * ────────────────────────────────────────────────────────────────────────── */

function formatClinicalMarkup(value: string) {
  let output = "";
  let index = 0;

  while (index < value.length) {
    if (value.startsWith("**", index)) {
      const end = value.indexOf("**", index + 2);
      if (end > index + 2) {
        output += `<strong>${escapeHtml(value.slice(index + 2, end))}</strong>`;
        index = end + 2;
        continue;
      }
    }

    if (value.startsWith("==", index)) {
      const end = value.indexOf("==", index + 2);
      if (end > index + 2) {
        output += `<span class="text-highlight">${escapeHtml(value.slice(index + 2, end))}</span>`;
        index = end + 2;
        continue;
      }
    }

    output += escapeHtml(value[index]);
    index += 1;
  }

  return output;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Impression tables
 * ────────────────────────────────────────────────────────────────────────── */

function impressionTableBody(rows: CaseBundle["impressionRows"], includeMissing: boolean) {
  const meaningfulRows = rows.filter((row) =>
    [row.title, row.evidence, row.evidenceAgainst, row.missingData, row.dxPlan, row.txPlan].some(hasText),
  );
  if (!meaningfulRows.length) return "";

  return `<div class="table-wrap">
  <table class="clin-table impression-table">
    <colgroup>
      <col class="col-rank" />
      <col class="col-impression" />
      <col />
      <col />
      ${includeMissing ? "<col />" : ""}
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Impression</th>
        <th>Evidence</th>
        <th>Against / uncertainty</th>
        ${includeMissing ? "<th>Missing data</th>" : ""}
        <th>Dx plan</th>
        <th>Tx plan</th>
      </tr>
    </thead>
    <tbody>
      ${meaningfulRows
        .map(
          (row) => `<tr>
        <td class="cell-rank"><span class="rank-chip">${escapeHtml(String(row.rank))}</span></td>
        <td class="cell-strong">${prewrap(row.title)}</td>
        <td>${prewrap(row.evidence)}</td>
        <td>${prewrap(row.evidenceAgainst)}</td>
        ${includeMissing ? `<td>${prewrap(row.missingData)}</td>` : ""}
        <td>${prewrap(row.dxPlan)}</td>
        <td>${prewrap(row.txPlan)}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Lab table
 * ────────────────────────────────────────────────────────────────────────── */

function labTableHtml(table: ReturnType<typeof normalizeLabTable>) {
  const meaningfulRows = table.rows.filter((row) => table.columns.some((column) => hasText(row[column])));
  if (!meaningfulRows.length) return "";

  // First column (typically "Test") gets a wider, left-anchored treatment; the
  // remaining numeric/value columns use the mono font for clean alignment.
  return `<div class="sub-block">
  <h3 class="sub-label">Lab table</h3>
  <div class="table-wrap">
  <table class="clin-table lab-table">
    <thead>
      <tr>${table.columns.map((column, idx) => `<th${idx === 0 ? ' class="lab-firstcol"' : ""}>${escapeHtml(column)}</th>`).join("")}</tr>
    </thead>
    <tbody>${meaningfulRows
      .map(
        (row) =>
          `<tr>${table.columns
            .map((column, idx) => {
              const raw = row[column] ?? "";
              const cls = idx === 0 ? "lab-firstcol cell-strong" : "lab-cell mono";
              const content = hasText(raw)
                ? prewrap(raw)
                : idx === 0
                  ? ""
                  : `<span class="lab-empty">–</span>`;
              return `<td class="${cls}">${content}</td>`;
            })
            .join("")}</tr>`,
      )
      .join("")}</tbody>
  </table>
  </div>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Problem list
 * ────────────────────────────────────────────────────────────────────────── */

function problemListBody(problems: CaseBundle["problems"]) {
  const meaningfulProblems = problems.filter((problem) =>
    [problem.title, problem.evidence, problem.notes].some(hasText),
  );
  if (!meaningfulProblems.length) return "";

  return `<div class="table-wrap">
  <table class="clin-table problem-table">
    <colgroup>
      <col class="col-priority" />
      <col class="col-problem" />
      <col class="col-status" />
      <col />
      <col />
    </colgroup>
    <thead>
      <tr>
        <th>Priority</th>
        <th>Problem</th>
        <th>Status</th>
        <th>Evidence</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>${meaningfulProblems
      .map(
        (problem) => `<tr>
        <td class="cell-rank"><span class="rank-chip">${escapeHtml(String(problem.priority))}</span></td>
        <td class="cell-strong">${prewrap(problem.title)}</td>
        <td class="cell-status">${statusBadge(String(problem.status ?? ""))}</td>
        <td>${prewrap(problem.evidence)}</td>
        <td>${prewrap(problem.notes)}</td>
      </tr>`,
      )
      .join("")}</tbody>
  </table>
  </div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Progress notes + SOAP
 * ────────────────────────────────────────────────────────────────────────── */

function progressNotesBody(notes: CaseBundle["progressNotes"]) {
  const renderedNotes = notes
    .map(renderProgressNote)
    .filter((note) => note.trim())
    .join("");
  if (!renderedNotes) return "";
  return renderedNotes;
}

function renderProgressNote(note: CaseBundle["progressNotes"][number]) {
  const headerParts = [
    note.date ? escapeHtml(note.date) : "",
    formatHospitalDay(note.hospitalDay),
  ].filter(Boolean);

  const sharedFields = definitionGrid([
    defRowRaw("Vitals", vitalsHtml(note.vitals)),
    defRow("Diet", note.diet),
    defRow("I/O", note.io),
    defRow("Overnight event", note.overnightEvent),
    defRow("Drain/tube", note.drainTube),
  ]);

  const problemTables = note.problems.map(renderSoapProblem).filter((item) => item.trim());

  if (!headerParts.length && !sharedFields.trim() && !problemTables.length) return "";

  return `<article class="progress-note">
    ${headerParts.length ? `<h3 class="progress-head">${headerParts.join(" · ")}</h3>` : ""}
    ${sharedFields}
    ${problemTables.join("")}
  </article>`;
}

function renderSoapProblem(problem: CaseBundle["progressNotes"][number]["problems"][number]) {
  const objectiveItems = objectiveItemsFromProblem(problem).filter(
    (item) => hasText(item.label) || hasText(item.value),
  );
  const objectiveImages = parseStoredJson<UploadedImage[]>(problem.objectiveImages, []);
  const planItems = planItemsFromProblem(problem).filter((item) => hasText(item.label) || hasText(item.value));

  const rows: Array<[string, string]> = [];
  if (hasText(problem.progressStatus)) {
    rows.push(["Status", `<div class="cell-badge">${statusBadge(String(problem.progressStatus))}</div>`]);
  }
  if (hasText(problem.subjective)) {
    rows.push(["S", prewrap(problem.subjective)]);
  }
  if (objectiveItems.length || objectiveImages.length) {
    rows.push(["O", `${soapSubfields(objectiveItems)}${renderImages("", objectiveImages)}`]);
  }
  if (hasText(problem.assessment)) {
    rows.push(["A", prewrap(problem.assessment)]);
  }
  if (planItems.length) {
    rows.push(["P", soapSubfields(planItems)]);
  }

  if (!rows.length) return "";

  return `<div class="soap-block">
    <div class="table-wrap">
    <table class="clin-table soap-table">
      <colgroup><col class="col-soap" /><col /></colgroup>
      <thead><tr><th>SOAP</th><th>${escapeHtml(problem.titleSnapshot || "Problem")}</th></tr></thead>
      <tbody>${rows
        .map(([label, content]) => `<tr><th class="soap-key">${escapeHtml(label)}</th><td>${content}</td></tr>`)
        .join("")}</tbody>
    </table>
    </div>
  </div>`;
}

function soapSubfields(items: Array<{ label: string; value: string }>) {
  if (!items.length) return "";
  return `<div class="soap-fields">${items
    .map(
      (item) =>
        `<div class="soap-field"><span class="soap-field-key">${escapeHtml(item.label || "Item")}</span>${prewrap(item.value)}</div>`,
    )
    .join("")}</div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Images
 * ────────────────────────────────────────────────────────────────────────── */

function renderImages(title: string, images: UploadedImage[]) {
  // Only render genuine base64 image data URLs. This blocks external URLs (e.g.
  // tracking pixels) or non-image data URLs that a malformed/legacy row could
  // otherwise cause the browser to fetch when the export is opened/printed.
  const meaningfulImages = images.filter((image) => isValidImageDataUrl(image.dataUrl));
  if (!meaningfulImages.length) return "";
  return `${title ? `<h3 class="sub-label">${escapeHtml(title)}</h3>` : ""}<div class="image-grid">${meaningfulImages
    .map(
      (image) => `<figure class="image-card">
        <div class="image-frame"><img src="${escapeAttribute(image.dataUrl)}" alt="${escapeAttribute(image.caption || image.fileName)}" /></div>
        ${hasText(image.caption) ? `<figcaption class="image-caption">${escapeHtml(image.caption)}</figcaption>` : ""}
        ${hasText(image.note) ? `<div class="image-note">${escapeHtml(image.note)}</div>` : ""}
      </figure>`,
    )
    .join("")}</div>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Vitals: compact labeled inline grid (skips empties)
 * ────────────────────────────────────────────────────────────────────────── */

function vitalsHtml(value: unknown) {
  const vitals = parseVitals(value);
  if (!vitals) return "";

  const cells = [
    vitalCell("BT", vitals.bt),
    vitalCell("BP", vitals.bp),
    vitalCell("PR", vitals.pr),
    vitalCell("RR", vitals.rr),
    vitalCell("SpO2", vitals.spo2),
    vitalCell("Height", vitals.heightCm, "cm"),
    vitalCell("Weight", vitals.weightKg, "kg"),
    vitalCell("BMI", vitals.bmi),
  ].filter(Boolean);

  if (!cells.length) return "";
  return `<div class="vitals-grid">${cells.join("")}</div>`;
}

function formatHospitalDay(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/^(HD(?:\b|\d)|hospital\s*day\b)/i.test(text)) return escapeHtml(text);
  return `HD ${escapeHtml(text)}`;
}

function vitalCell(label: string, value: string | undefined, unit = "") {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const unitHtml = unit ? `<span class="vital-unit"> ${escapeHtml(unit)}</span>` : "";
  return `<span class="vital-cell"><span class="vital-label">${escapeHtml(label)}</span><span class="vital-value mono">${escapeHtml(text)}${unitHtml}</span></span>`;
}

function parseVitals(value: unknown): Record<string, string> | null {
  if (typeof value === "string") {
    try {
      return parseVitals(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  return value as Record<string, string>;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Status badges
 * ────────────────────────────────────────────────────────────────────────── */

function statusBadge(rawStatus: string) {
  const status = String(rawStatus ?? "").trim();
  if (!status) return "";
  const key = status.toLowerCase();
  const map: Record<string, string> = {
    active: "badge-active",
    improving: "badge-improving",
    worsening: "badge-worsening",
    resolved: "badge-resolved",
    background: "badge-background",
    closed: "badge-resolved",
  };
  const cls = map[key] ?? "badge-neutral";
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Small text utilities
 * ────────────────────────────────────────────────────────────────────────── */

// Escape + wrap so that pre-wrap whitespace survives but the cell never overflows.
function prewrap(value: unknown) {
  const text = String(value ?? "");
  if (!text.trim()) return "";
  return `<span class="pre">${escapeHtml(text)}</span>`;
}

function seoulParts(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Build Asia/Seoul wall-clock parts in a locale-independent way so the
  // formatted output is stable and zero-padded everywhere it appears.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour"), mi: get("minute") };
}

function formatTimestamp(value: Date | string | null | undefined) {
  const p = seoulParts(value);
  if (!p) return "";
  const hour = p.h === "24" ? "00" : p.h; // some ICU builds emit "24" at midnight
  return `${p.y}-${p.mo}-${p.d} ${hour}:${p.mi}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: unknown) {
  return escapeHtml(value);
}

function hasText(value: unknown) {
  return String(value ?? "").trim().length > 0;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Styles: clinical navy + slate, print-first (A4 / print-to-PDF)
 * ────────────────────────────────────────────────────────────────────────── */

function baseStyles() {
  return `
    :root {
      --navy: #1e3a5f;
      --navy-deep: #16365c;
      --ink: #0f172a;
      --ink-2: #334155;
      --ink-3: #475569;
      --muted: #64748b;
      --rule: #cbd5e1;
      --rule-light: #e2e8f0;
      --zebra: #eef3f8;
      --paper: #ffffff;
    }

    @page {
      size: A4;
      /* The repeating masthead/footer are in-flow (table head/foot groups), so
         normal page margins are enough. */
      margin: 13mm 14mm 12mm;
    }

    html, body, * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--paper);
    }

    body {
      font-family: "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", Arial, sans-serif;
      color: var(--ink);
      font-size: 11.5px;
      line-height: 1.55;
    }

    .doc { width: 100%; }

    .mono {
      font-family: "SFMono-Regular", "Consolas", "Liberation Mono", Menlo, monospace;
      font-variant-numeric: tabular-nums;
    }

    /* Long unbroken tokens (URLs, ids, lab codes) must never overflow the page. */
    .pre, .def-value, td, th, .info-value, .sub-text, .image-note {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .pre { white-space: pre-wrap; }
    .sub-text { white-space: pre-wrap; margin: 0; }

    /* ── Highlight markup (preserved exactly) ────────────────────────────── */
    .text-highlight {
      background-color: #fde68a;
      border-radius: 2px;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
      box-shadow: inset 0 -0.85em 0 #fde68a;
      padding: 0 2px;
      text-decoration: underline;
      text-decoration-color: #fde68a;
      text-decoration-skip-ink: none;
      text-decoration-thickness: 0.85em;
      text-underline-offset: -0.45em;
    }
    strong { font-weight: 700; color: var(--ink); }

    /* ── Repeating masthead + footer via table header/footer groups ───────────
       <thead>/<tfoot> are natively re-printed at the top/bottom of every page,
       which is the reliable cross-page repeat technique (position: fixed is not
       honored consistently by Chrome's print engine). ──────────────────────── */
    .page-frame { width: 100%; border-collapse: collapse; }
    .page-frame > thead { display: table-header-group; }
    .page-frame > tfoot { display: table-footer-group; }
    .page-frame > thead > tr > td,
    .page-frame > tfoot > tr > td,
    .page-frame > tbody > tr > td { border: 0; padding: 0; }

    .running-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1.5px solid var(--navy);
      padding-bottom: 4px;
      margin-bottom: 12px;
    }
    .rh-left { display: flex; align-items: center; gap: 7px; min-width: 0; }
    .rh-logo { height: 15px; width: 15px; object-fit: contain; flex: 0 0 auto; }
    .rh-doctype {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--navy);
    }
    .rh-ident {
      flex: 0 0 auto;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--muted);
      white-space: nowrap;
    }
    .running-footer {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid var(--rule);
      padding-top: 4px;
      margin-top: 12px;
      font-size: 8px;
      color: var(--muted);
    }
    .rf-note { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rf-stamp { flex: 0 0 auto; white-space: nowrap; }

    /* ── Page-1 title block ──────────────────────────────────────────────── */
    .page-title {
      margin: 0 0 13px;
      padding: 0 0 9px;
      border-bottom: 2px solid var(--navy);
    }
    .pt-title {
      margin: 0;
      font-size: 21px;
      font-weight: 700;
      line-height: 1.25;
      color: var(--ink);
      overflow-wrap: anywhere;
    }

    /* ── Document info block ─────────────────────────────────────────────── */
    .info-block {
      border: 1px solid var(--rule);
      border-radius: 3px;
      margin-bottom: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
      overflow: hidden;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .info-cell {
      padding: 7px 10px;
      border-right: 1px solid var(--rule-light);
      border-bottom: 1px solid var(--rule-light);
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .info-cell:nth-child(2n) { border-right: none; }
    .info-label {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      font-weight: 700;
    }
    .info-value { font-size: 11px; color: var(--ink); font-weight: 600; }

    .info-aux {
      display: flex;
      gap: 10px;
      padding: 7px 10px;
      border-bottom: 1px solid var(--rule-light);
      align-items: baseline;
    }
    .info-aux:last-child { border-bottom: none; }
    .info-aux-label {
      flex: 0 0 64px;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      font-weight: 700;
      padding-top: 1px;
    }
    .info-aux-value { flex: 1 1 auto; min-width: 0; color: var(--ink-2); font-size: 11px; }
    .info-summary .info-aux-value { color: var(--ink-2); }
    /* ── Clinical sections ───────────────────────────────────────────────── */
    .clin-section { margin: 0 0 18px; }
    .section-head {
      display: flex;
      align-items: baseline;
      gap: 9px;
      margin: 0 0 9px;
      padding-bottom: 5px;
      border-bottom: 2px solid var(--navy);
      break-after: avoid;
      page-break-after: avoid;
    }
    .section-num {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 5px;
      background: var(--navy);
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 700;
      border-radius: 4px;
      line-height: 1;
    }
    .section-title { font-size: 14px; font-weight: 700; color: var(--ink); }
    .section-sub { font-size: 10px; color: var(--muted); font-weight: 500; }
    .section-body { }

    /* ── Definition grid (admission + progress shared fields) ────────────── */
    .def-grid {
      border: 1px solid var(--rule-light);
      border-radius: 3px;
      overflow: hidden;
    }
    .def-row {
      display: grid;
      grid-template-columns: 150px 1fr;
      border-bottom: 1px solid var(--rule-light);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .def-row:last-child { border-bottom: none; }
    .def-label {
      padding: 6px 10px;
      background: var(--zebra);
      border-right: 1px solid var(--rule-light);
      font-weight: 700;
      color: var(--ink-2);
      font-size: 10.5px;
    }
    .def-value { padding: 6px 11px; min-width: 0; color: var(--ink); }
    .def-text { white-space: pre-wrap; }

    /* Vitals strip is allowed to break if extremely tall, but rows shouldn't. */
    .vitals-grid { display: flex; flex-wrap: wrap; gap: 5px 7px; }
    .vital-cell {
      display: inline-flex;
      align-items: baseline;
      gap: 5px;
      border: 1px solid var(--rule-light);
      border-radius: 2px;
      padding: 2px 8px;
    }
    .vital-label {
      color: var(--muted);
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .vital-value { font-size: 10.5px; color: var(--ink); font-weight: 600; }
    .vital-unit { color: var(--muted); font-weight: 500; }

    /* ── Sub blocks (loose labeled content) ──────────────────────────────── */
    /* Loose content block (lab table, image group, free-text). Must be allowed
       to break across pages so a long table flows instead of being shoved whole
       onto the next page. */
    .sub-block { margin: 0 0 12px; }
    .sub-label {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--navy);
      margin: 0 0 5px;
    }

    /* ── Tables (clinical, navy header) ──────────────────────────────────── */
    .table-wrap { width: 100%; }
    table.clin-table {
      border-collapse: collapse;
      width: 100%;
      margin: 0 0 4px;
      table-layout: fixed;
    }
    .clin-table thead { display: table-header-group; }
    .clin-table tr { break-inside: avoid; page-break-inside: avoid; }
    .clin-table th,
    .clin-table td {
      border: 1px solid var(--rule);
      padding: 5px 7px;
      text-align: left;
      vertical-align: top;
    }
    .clin-table thead th {
      background: var(--navy);
      color: #ffffff;
      font-weight: 700;
      font-size: 10.5px;
      letter-spacing: 0.01em;
      border-color: var(--navy-deep);
    }
    /* Full cell-grid ruling instead of zebra fills — reads as a clinical form,
       not a data-table widget. */
    .cell-strong { font-weight: 600; color: var(--ink); }
    .cell-badge { margin-top: 4px; }

    /* Narrow rank / priority columns + centered chips */
    .col-rank { width: 42px; }
    .col-priority { width: 58px; }
    .col-status { width: 84px; }
    .col-impression { width: 21%; }
    .col-problem { width: 22%; }
    .col-soap { width: 56px; }
    .cell-rank { text-align: center; vertical-align: middle; }
    .cell-status { vertical-align: middle; }
    .rank-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      background: var(--navy);
      color: #ffffff;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 700;
      line-height: 1;
    }

    /* Lab table: content-sized columns so empty time-point columns stay narrow
       and the Interpretation column gets the room it needs (instead of the
       forced-equal widths of table-layout: fixed). */
    .lab-table { table-layout: auto; }
    .lab-table thead th { white-space: nowrap; }
    /* Let the Test column wrap if a name is long so it stops hogging width and
       value columns (e.g. Interpretation) get more room. */
    .lab-table .lab-firstcol { min-width: 64px; }
    .lab-cell { font-size: 10.5px; }
    .lab-empty { color: #94a3b8; }

    /* ── Progress notes / SOAP ───────────────────────────────────────────── */
    /* A progress note can be tall (several SOAP tables); let it break across
       pages instead of jumping whole to the next page and leaving a gap. */
    /* No bordered card: a header rule + flowing content reads as a clinical form
       and avoids a left-accent border that over-runs across a page break. */
    .progress-note {
      margin: 0 0 15px;
    }
    .progress-head {
      margin: 0 0 8px;
      padding: 0 0 4px;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--navy);
      letter-spacing: 0.01em;
      border-bottom: 1.5px solid var(--navy);
      break-after: avoid;
      page-break-after: avoid;
    }
    .progress-note .def-grid { margin-bottom: 10px; }

    .soap-block { margin: 10px 0 0; }
    .soap-block:first-of-type { margin-top: 4px; }
    .soap-title {
      margin: 0 0 5px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--ink);
      break-after: avoid;
      page-break-after: avoid;
    }
    .soap-table .soap-key {
      background: var(--zebra);
      color: var(--navy);
      font-weight: 700;
      text-align: center;
      vertical-align: middle;
      border-color: var(--rule);
    }

    /* SOAP O/P subfields: borderless inline label-value lines so their left
       text edge lines up with the plain S/A rows (no nested-table double
       border, no extra indent column). */
    .soap-fields { display: block; }
    .soap-field { margin: 0 0 2px; }
    .soap-field:last-child { margin-bottom: 0; }
    .soap-field-key {
      font-weight: 700;
      color: var(--navy);
      font-size: 11px;
      letter-spacing: 0.02em;
      margin-right: 7px;
      vertical-align: baseline;
    }

    /* ── Images ──────────────────────────────────────────────────────────── */
    .image-grid {
      display: grid;
      gap: 9px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin: 4px 0 8px;
    }
    .image-card {
      break-inside: avoid;
      page-break-inside: avoid;
      border: 1px solid var(--rule-light);
      border-radius: 3px;
      padding: 6px;
      margin: 0;
      background: #ffffff;
    }
    .image-frame {
      width: 100%;
      background: var(--zebra);
      border: 1px solid var(--rule-light);
      border-radius: 2px;
      overflow: hidden;
    }
    .image-card img {
      display: block;
      max-height: 210px;
      max-width: 100%;
      width: 100%;
      object-fit: contain;
    }
    .image-caption { color: var(--ink-2); font-size: 10.5px; font-weight: 700; margin-top: 5px; }
    .image-note { color: var(--muted); font-size: 9.5px; margin-top: 2px; white-space: pre-wrap; }

    /* ── Badges (subdued, grayscale-legible) ─────────────────────────────── */
    /* Flat ruled status tag (no fill, squared, uppercase) — a document marker,
       not an app pill. Color carried by the border + text only. */
    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 1px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border: 1px solid var(--rule);
      background: transparent;
      color: var(--ink-2);
      white-space: nowrap;
    }
    .badge-active { color: #1e3a5f; border-color: #9fb2c9; }
    .badge-improving { color: #1f5132; border-color: #9ccaad; }
    .badge-worsening { color: #7a2222; border-color: #d8a8a8; }
    .badge-resolved { color: #475569; border-color: #c7d0dc; }
    .badge-background { color: #475569; border-color: #d4dae2; }
    .badge-neutral { color: #334155; border-color: #d4dae2; }

    /* ── Footer ──────────────────────────────────────────────────────────── */
    .doc-footer {
      margin-top: 22px;
      padding-top: 9px;
      border-top: 1px solid var(--rule);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .footer-disclaimer { margin: 0; font-size: 9.5px; color: var(--muted); line-height: 1.5; }
    .footer-disclaimer strong { color: var(--ink-3); }
    .footer-stamp { margin: 4px 0 0; font-size: 9px; color: var(--muted); }

    /* ── Print page numbers + screen affordance ──────────────────────────── */
    .page-foot { display: none; }
    @media print {
      /* Only atomic units stay unbreakable; sections, tables and notes flow
         naturally across page boundaries (no whole-block page jumps). */
      .image-card, .info-block, .def-row, .clin-table tr {
        page-break-inside: avoid;
      }
    }
  `;
}
