// QA harness: renders the report across several stress-test case variants so the
// design can be reviewed for robustness (sparse / very long / image-heavy /
// page-spanning tables) — not just one happy-path case. Output goes to the
// git-ignored .review-cases/ directory (HTML + PDF + per-page PNGs), nothing here
// is committed. Run after report-template changes:
//
//   npm run report:review-cases
//
// HTML always renders (Vite SSR). PDF needs a Chromium browser (set CHROME_PATH
// to override auto-detection). Per-page PNGs additionally need poppler's pdftoppm
// (set PDFTOPPM_PATH, or have it on PATH); if missing, PDFs are still produced.
//
// All case data is fully synthetic and de-identified.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { createServer } from "vite";

const ROOT = process.cwd();
const OUT = process.env.REVIEW_OUT || path.join(ROOT, ".review-cases");

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  return candidates.find((c) => {
    try {
      return fs.existsSync(c);
    } catch {
      return false;
    }
  });
}

function findPdftoppm() {
  if (process.env.PDFTOPPM_PATH && fs.existsSync(process.env.PDFTOPPM_PATH)) return process.env.PDFTOPPM_PATH;
  // winget (oschwartz10612.Poppler) install location on Windows
  const wingetRoot = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  try {
    for (const dir of fs.readdirSync(wingetRoot)) {
      if (!/Poppler/i.test(dir)) continue;
      const base = path.join(wingetRoot, dir);
      for (const sub of fs.readdirSync(base)) {
        const exe = path.join(base, sub, "Library", "bin", "pdftoppm.exe");
        if (fs.existsSync(exe)) return exe;
      }
    }
  } catch {
    /* ignore */
  }
  return "pdftoppm"; // fall back to PATH
}

async function loadRenderer() {
  const server = await createServer({
    configFile: false,
    root: ROOT,
    resolve: { alias: { "@": path.join(ROOT, "src") } },
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
    appType: "custom",
    logLevel: "error",
  });
  const mod = await server.ssrLoadModule("/src/export/templates/submission-html.ts");
  return { render: mod.renderSubmissionHtml, close: () => server.close() };
}

async function placeholder(w, h, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#e9eef5"/><rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="#c2cedd" stroke-width="2"/><text x="${w / 2}" y="${h / 2}" font-family="Arial" font-size="16" fill="#71819a" text-anchor="middle">${label}</text></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

const emptyAdmission = {
  cc: "", hpi: "", pmh: "", psh: "", medication: "", allergy: "", familyHistory: "",
  socialHistory: "", alcoholHistory: "", smokingHistory: "", ros: "", physicalExam: "",
  initialVitals: "{}", imageProcedureText: "",
};
const emptyDiag = {
  labTable: JSON.stringify({ schemaVersion: 1, columns: ["Test", "Unit", "Ref Range", "Result", "Interpretation"], rows: [] }),
  imageAttachments: "[]", imageFindingsText: "", procedureFindingsText: "", summaryText: "",
};

function soapProblem(over) {
  return {
    progressStatus: "active", titleSnapshot: "문제", subjective: "", objectiveImages: "[]",
    objectivePe: "", objectiveLab: "", objectiveImageProcedure: "", objectiveDrain: "",
    assessment: "", objectiveItems: "[]", planItems: "[]",
    planDx: "", planTx: "", planMonitoring: "", planEducation: "", ...over,
  };
}

// ── Variant A: minimal / sparse (only a few sections populated) ──────────────
function caseMinimal() {
  return {
    id: "min0001casea", title: "45/F, 두통", department: "신경과", status: "active",
    summary: "", updatedAt: new Date("2026-06-20T00:00:00Z"), tags: [],
    admissionNote: { ...emptyAdmission, cc: "2일 전부터 시작된 양측 두통", physicalExam: "신경학적 검사 정상" },
    diagnosticData: emptyDiag,
    impressionRows: [
      { stage: "INITIAL", rank: 1, title: "긴장성 두통", evidence: "양측성 압박감, 스트레스 관련", evidenceAgainst: "", missingData: "적색 신호 증상 없음 확인 필요", dxPlan: "신경학적 검사", txPlan: "NSAIDs, 휴식" },
    ],
    problems: [{ priority: 1, title: "두통", status: "active", evidence: "양측 압박성", notes: "경과 관찰" }],
    progressNotes: [],
  };
}

// ── Variant B: long / overflow (multi-page, tables span page breaks) ─────────
function caseLong() {
  const longText = (n) => Array.from({ length: n }, (_, i) => `소견 문장 ${i + 1}: 환자는 지속적인 증상을 보이며 추가 평가가 필요함.`).join(" ");
  const impressions = Array.from({ length: 22 }, (_, i) => ({
    stage: "INITIAL", rank: i + 1, title: `감별진단 ${i + 1} (Differential dx ${i + 1})`,
    evidence: `근거: ${longText(2)}`, evidenceAgainst: "반대 근거: 일부 소견은 비전형적임.",
    missingData: `추가검사 ${i + 1}`, dxPlan: `진단계획 ${i + 1}: 영상/검사`, txPlan: `치료계획 ${i + 1}`,
  }));
  const problems = Array.from({ length: 9 }, (_, i) => ({
    priority: i + 1, title: `문제 ${i + 1}`, status: ["active", "improving", "worsening", "resolved", "background"][i % 5],
    evidence: longText(1), notes: `메모 ${i + 1}`,
  }));
  const notes = Array.from({ length: 3 }, (_, d) => ({
    date: `2026-06-${20 + d}`, hospitalDay: `HD#${d + 1}`,
    vitals: JSON.stringify({ bt: "37.2", bp: "120/80", pr: "78", rr: "18", spo2: "98%" }),
    diet: "일반식", io: "I 2000 / O 1800", overnightEvent: longText(2), drainTube: "",
    problems: Array.from({ length: 3 }, (_, p) => soapProblem({
      progressStatus: "improving", titleSnapshot: `문제 ${p + 1}`, subjective: longText(2),
      objectiveItems: JSON.stringify([
        { id: `pe${d}${p}`, label: "PE", value: longText(1) },
        { id: `lab${d}${p}`, label: "Lab", value: "WBC 9.6, CRP 5.2, " + longText(1) },
      ]),
      assessment: longText(2), planItems: JSON.stringify([{ id: `tx${d}${p}`, label: "Tx", value: longText(1) }]),
    })),
  }));
  return {
    id: "long0002caseb",
    title: "72/M, 다발성 동반질환을 가진 발열 및 의식저하 (a deliberately long case title to test wrapping in the masthead and title block)",
    department: "내과", status: "active",
    summary: "여러 장기를 침범한 복합 문제 환자로, 광범위한 감별과 다수의 경과기록이 필요함.",
    updatedAt: new Date("2026-06-22T00:00:00Z"),
    tags: ["발열", "의식저하", "패혈증", "다발성문제", "노인", "동반질환", "장기입원"],
    admissionNote: {
      ...emptyAdmission, cc: "발열과 의식저하", hpi: longText(8),
      pmh: "고혈압, 당뇨, 만성신질환 3기, 심방세동", medication: "amlodipine, metformin, apixaban, furosemide",
      ros: "[General]\n- fever (+): 38.9\n- chills (+)\n[Neuro]\n- confusion (+)\n- headache (-)\n[Resp]\n- cough (+)\n- dyspnea (+)",
      physicalExam: "General: ill-looking, **drowsy**\nChest: ==coarse breath sounds, both lower lung==\nAbdomen: soft\n" + longText(3),
      initialVitals: JSON.stringify({ bt: "38.9", bp: "92/58", pr: "112", rr: "24", spo2: "91%", heightCm: "168", weightKg: "70", bmi: "24.8" }),
    },
    diagnosticData: {
      labTable: JSON.stringify({
        schemaVersion: 1,
        columns: ["Test", "Unit", "Ref Range", "Day 1", "Day 2", "Day 3", "Day 4", "Interpretation"],
        rows: Array.from({ length: 14 }, (_, i) => ({
          Test: `검사항목 ${i + 1}`, Unit: "U", "Ref Range": "0-10",
          "Day 1": `${10 + i}`, "Day 2": `${9 + i}`, "Day 3": `${8 + i}`, "Day 4": `${7 + i}`,
          Interpretation: i % 3 === 0 ? "상승, 추적 필요" : "정상 범위",
        })),
      }),
      imageAttachments: "[]", imageFindingsText: "Chest CT: 양측 폐 침윤. " + longText(2),
      procedureFindingsText: longText(2), summaryText: longText(3),
    },
    impressionRows: impressions.concat([
      { stage: "FINAL", rank: 1, title: "패혈증 (폐렴 기원)", evidence: longText(2), evidenceAgainst: "", missingData: "", dxPlan: "경과 관찰", txPlan: "항생제" },
    ]),
    problems, progressNotes: notes,
  };
}

// ── Variant C: image-heavy (diagnostic grid + SOAP objective image) ──────────
async function caseImages() {
  const wide = await placeholder(520, 320, "CHEST X-RAY (sample)");
  const tall = await placeholder(300, 440, "ABDOMEN CT (sample)");
  const sq = await placeholder(360, 360, "US (sample)");
  const soapImg = await placeholder(420, 300, "WOUND (sample)");
  return {
    id: "img0003casec", title: "58/M, 복부 둔상 후 다발성 손상", department: "외과", status: "active",
    summary: "교통사고 후 복부 및 흉부 영상 검사 다수 시행.",
    updatedAt: new Date("2026-06-21T00:00:00Z"), tags: ["외상", "복부둔상", "영상"],
    admissionNote: {
      ...emptyAdmission, cc: "교통사고 후 복부 통증", hpi: "운전 중 추돌사고로 내원. 복부 및 흉부 통증 호소.",
      physicalExam: "Abdomen: ==RLQ tenderness==, guarding (+)\nChest: 압통 (+)",
      initialVitals: JSON.stringify({ bt: "36.8", bp: "110/70", pr: "96", spo2: "96%" }),
    },
    diagnosticData: {
      ...emptyDiag,
      imageAttachments: JSON.stringify([
        { id: "i1", fileName: "cxr.png", mimeType: "image/png", dataUrl: wide, caption: "흉부 X선 — 늑골 골절 의심", note: "우측 늑골 다발 골절 (예시 이미지)" },
        { id: "i2", fileName: "ct.png", mimeType: "image/png", dataUrl: tall, caption: "복부 CT — 비장 손상", note: "비장 주위 혈종 (예시)" },
        { id: "i3", fileName: "us.png", mimeType: "image/png", dataUrl: sq, caption: "FAST US — 복강내 액체", note: "(예시)" },
      ]),
      imageFindingsText: "다발성 늑골 골절 및 비장 손상 grade II.",
      procedureFindingsText: "진단적 복강경 고려.", summaryText: "혈역학적으로 안정적이어서 보존적 치료 진행.",
    },
    impressionRows: [
      { stage: "INITIAL", rank: 1, title: "비장 손상 (Splenic injury, grade II)", evidence: "CT 소견, FAST 양성", evidenceAgainst: "혈압 안정", missingData: "추적 CT", dxPlan: "추적 영상", txPlan: "보존적 치료, 모니터링" },
    ],
    problems: [{ priority: 1, title: "비장 손상", status: "active", evidence: "CT grade II", notes: "보존적 치료" }],
    progressNotes: [{
      date: "2026-06-21", hospitalDay: "HD#1",
      vitals: JSON.stringify({ bt: "37.0", bp: "112/72", pr: "88" }),
      diet: "금식", io: "", overnightEvent: "혈압 안정 유지", drainTube: "",
      problems: [soapProblem({
        progressStatus: "active", titleSnapshot: "비장 손상", subjective: "복통 호전",
        objectiveItems: JSON.stringify([{ id: "o1", label: "PE", value: "복부 압통 감소" }]),
        objectiveImages: JSON.stringify([{ id: "si", fileName: "w.png", mimeType: "image/png", dataUrl: soapImg, caption: "추적 영상", note: "(예시)" }]),
        assessment: "안정적, 보존적 치료 지속",
        planItems: JSON.stringify([{ id: "p1", label: "Tx", value: "절대 안정, Hb 추적" }]),
      })],
    }],
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = findBrowser();
  const pdftoppm = findPdftoppm();
  if (!browser) console.warn("No Chromium browser found (set CHROME_PATH) — writing HTML only.");

  const { render, close } = await loadRenderer();
  const variants = [
    ["minimal", caseMinimal()],
    ["long", caseLong()],
    ["images", await caseImages()],
  ];
  try {
    for (const [name, data] of variants) {
      const htmlPath = path.join(OUT, `${name}.html`);
      fs.writeFileSync(htmlPath, render(data, { includeBranding: true, includeFooter: true }), "utf8");
      let pages = 0;
      if (browser) {
        const pdfPath = path.join(OUT, `${name}.pdf`);
        spawnSync(browser, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href], { stdio: "ignore" });
        for (const f of fs.readdirSync(OUT)) if (new RegExp(`^${name}-\\d+\\.png$`).test(f)) fs.unlinkSync(path.join(OUT, f));
        const r = spawnSync(pdftoppm, ["-png", "-r", "130", pdfPath, path.join(OUT, name)], { stdio: "ignore" });
        if (r.status === 0) pages = fs.readdirSync(OUT).filter((f) => new RegExp(`^${name}-\\d+\\.png$`).test(f)).length;
      }
      console.log(`${name}: html + pdf${pages ? ` + ${pages} page png(s)` : " (pdftoppm unavailable — no page PNGs)"}`);
    }
  } finally {
    await close();
  }
  console.log(`\nReview output: ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
