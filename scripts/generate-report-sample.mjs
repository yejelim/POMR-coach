// Generates the canonical POMR submission-report sample and renders it to
// docs/report-sample/ as HTML + PDF. Run this after changing the report
// template so the committed sample always reflects the latest design:
//
//   npm run report:sample
//   (or: node scripts/generate-report-sample.mjs)
//
// HTML is always produced (via Vite SSR, the same pipeline the tests use).
// The PDF additionally requires a Chromium-based browser (Chrome or Edge);
// set CHROME_PATH to point at one if auto-detection fails.
//
// The sample case is fully synthetic and de-identified — no real patient data.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createServer } from "vite";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "report-sample");
const HTML_PATH = path.join(OUT_DIR, "report-sample.html");
const PDF_PATH = path.join(OUT_DIR, "report-sample.pdf");
const TEMPLATE = "/src/export/templates/submission-html.ts";

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
  try {
    const mod = await server.ssrLoadModule(TEMPLATE);
    return { render: mod.renderSubmissionHtml, close: () => server.close() };
  } catch (error) {
    await server.close();
    throw error;
  }
}

function sampleCase() {
  return {
    id: "clv9k2m7x0001abcd3f8gh2jq",
    title: "67/M, 상복부 통증 및 황달",
    department: "소화기내과",
    status: "active",
    summary: "ERCP 후 경과 관찰 중인 담석성 담관염/췌장염 의심 환자. 항생제 및 보존적 치료 중.",
    updatedAt: new Date("2026-06-22T08:30:00Z"),
    tags: [{ name: "복통" }, { name: "황달" }, { name: "ERCP" }, { name: "담석" }, { name: "췌장염" }],
    admissionNote: {
      cc: "3일 전부터 발생한 상복부 통증과 눈의 노래짐",
      hpi:
        "내원 3일 전 기름진 식사 후 발생한 상복부 통증으로, 통증은 우상복부와 명치 부위에 국한되며 등으로 방사됨. " +
        "동반된 오심/구토가 있었고, 내원 1일 전부터 공막 황달과 진한 소변을 인지함. 발열 동반.",
      pmh: "고혈압 (5년, amlodipine 5mg 복용 중), 당뇨병 (-)",
      psh: "충수절제술 (20년 전)",
      medication: "Amlodipine 5mg qd",
      allergy: "특이 약물 알레르기 없음 (NKDA)",
      familyHistory: "특이 가족력 없음",
      socialHistory: "회사원, 기혼",
      alcoholHistory: "소주 주 2회, 회당 1병 (약 20년)",
      smokingHistory: "20갑년, 현재 흡연 중",
      ros:
        "[General]\n- fever (+): 38.4도\n- weight loss (-)\n[GI]\n- nausea (+)\n- vomiting (+): 2회\n- abdominal pain (+): RUQ/epigastric\n- diarrhea (-)\n[Hepatobiliary]\n- jaundice (+)\n- dark urine (+)\n[Additional notes]\n증상은 식후 악화되는 양상.",
      physicalExam:
        "V/S: 위 vitals 참조\nGeneral: acute ill-looking, 공막 **황달(icteric sclera)** 관찰\nAbdomen: ==RUQ tenderness (+), Murphy's sign (+)==, rebound tenderness (-), bowel sound normoactive\nExtremities: pitting edema (-)",
      initialVitals: JSON.stringify({
        bt: "38.4",
        bp: "138/86",
        pr: "98",
        rr: "20",
        spo2: "97%",
        heightCm: "172",
        weightKg: "74",
        bmi: "25.0",
      }),
      imageProcedureText: "Abdominal US (ER): 담낭 결석 및 담낭벽 비후 소견, 총담관 확장 (CBD 11mm) 동반.",
    },
    diagnosticData: {
      labTable: JSON.stringify({
        schemaVersion: 1,
        columns: ["Test", "Unit", "Ref Range", "OPD", "Admission", "ERCP day", "Post-ERCP D1", "Interpretation"],
        rows: [
          { Test: "WBC", Unit: "10^3/uL", "Ref Range": "4.0-10.0", OPD: "", Admission: "14.2", "ERCP day": "12.8", "Post-ERCP D1": "9.6", Interpretation: "백혈구 증가, 호전 중" },
          { Test: "Hb", Unit: "g/dL", "Ref Range": "13-17", OPD: "", Admission: "14.1", "ERCP day": "13.8", "Post-ERCP D1": "13.5", Interpretation: "정상" },
          { Test: "Platelet", Unit: "10^3/uL", "Ref Range": "150-400", OPD: "", Admission: "232", "ERCP day": "210", "Post-ERCP D1": "198", Interpretation: "정상" },
          { Test: "Total bilirubin", Unit: "mg/dL", "Ref Range": "0.2-1.2", OPD: "", Admission: "4.8", "ERCP day": "5.2", "Post-ERCP D1": "3.1", Interpretation: "상승, 폐쇄성 황달" },
          { Test: "AST/ALT", Unit: "IU/L", "Ref Range": "0-40", OPD: "", Admission: "182/210", "ERCP day": "150/188", "Post-ERCP D1": "92/120", Interpretation: "간담도 효소 상승" },
          { Test: "ALP", Unit: "IU/L", "Ref Range": "40-120", OPD: "", Admission: "320", "ERCP day": "298", "Post-ERCP D1": "240", Interpretation: "상승" },
          { Test: "Lipase", Unit: "U/L", "Ref Range": "13-60", OPD: "", Admission: "640", "ERCP day": "410", "Post-ERCP D1": "180", Interpretation: "췌장염 시사" },
          { Test: "CRP", Unit: "mg/dL", "Ref Range": "0-0.5", OPD: "", Admission: "12.4", "ERCP day": "9.8", "Post-ERCP D1": "5.2", Interpretation: "염증 상승" },
        ],
      }),
      imageAttachments: "[]",
      imageFindingsText: "Abdominal CT: 총담관 내 결석 의심, 췌장 주위 지방 침윤 소견.",
      procedureFindingsText: "ERCP: 총담관 결석 제거, EST 및 ENBD 삽입함.",
      summaryText: "영상 및 시술 소견상 담석에 의한 담관염 및 췌장염에 합당하며, ERCP로 담관 감압 시행함.",
    },
    impressionRows: [
      { stage: "INITIAL", rank: 1, title: "급성 담관염 (Acute cholangitis)", evidence: "발열, 황달, RUQ 통증 (Charcot triad), 담관 확장", evidenceAgainst: "혈압 안정적, 의식 명료", missingData: "혈액배양, MRCP", dxPlan: "혈액배양, MRCP/ERCP", txPlan: "광범위 항생제, 수액" },
      { stage: "INITIAL", rank: 2, title: "급성 췌장염 (Gallstone pancreatitis)", evidence: "Lipase 640 (10배 상승), 상복부 통증", evidenceAgainst: "통증이 RUQ 우세", missingData: "조영증강 CT", dxPlan: "복부 CT", txPlan: "금식, 수액, 진통" },
      { stage: "INITIAL", rank: 3, title: "급성 담낭염 (Acute cholecystitis)", evidence: "Murphy sign (+), 담낭벽 비후", evidenceAgainst: "전신 염증이 담관염에 더 부합", missingData: "HIDA scan", dxPlan: "초음파 추적", txPlan: "항생제, 추후 담낭절제 고려" },
      { stage: "FINAL", rank: 1, title: "담석성 급성 담관염", evidence: "ERCP에서 총담관 결석 확인 및 제거, 빌리루빈/효소 호전", evidenceAgainst: "", missingData: "", dxPlan: "경과 관찰", txPlan: "항생제 7-10일, 추후 LC" },
      { stage: "FINAL", rank: 2, title: "담석성 급성 췌장염 (경증)", evidence: "Lipase 호전, 통증 감소", evidenceAgainst: "", missingData: "", dxPlan: "경과 관찰", txPlan: "식이 진행" },
    ],
    problems: [
      { priority: 1, title: "담석성 담관염", status: "improving", evidence: "ERCP 후 빌리루빈/CRP 감소", notes: "항생제 D3, ENBD 유지 중" },
      { priority: 2, title: "담석성 췌장염", status: "improving", evidence: "Lipase 640→180", notes: "통증 호전, 식이 진행 예정" },
      { priority: 3, title: "고혈압", status: "active", evidence: "기왕력, BP 138/86", notes: "amlodipine 유지" },
      { priority: 4, title: "흡연", status: "background", evidence: "20갑년 현재 흡연", notes: "금연 교육 필요" },
    ],
    progressNotes: [
      {
        date: "2026-06-22",
        hospitalDay: "HD#3 / POD(ERCP)#1",
        vitals: JSON.stringify({ bt: "37.4", bp: "126/78", pr: "84", rr: "18", spo2: "98%" }),
        diet: "금식 → 미음 시작",
        io: "I 2400 / O 1900 (소변 1600, ENBD 300)",
        overnightEvent: "야간 발열 없음, 통증 NRS 3점으로 호전",
        drainTube: "ENBD 유지, 배액 맑은 담즙 양상",
        problems: [
          {
            progressStatus: "improving",
            titleSnapshot: "담석성 담관염",
            subjective: "복통 많이 줄었고 열도 안 남",
            objectiveItems: JSON.stringify([
              { id: "a", label: "PE", value: "공막 황달 감소, RUQ 압통 경미" },
              { id: "b", label: "Lab", value: "T.bil 5.2→3.1, CRP 9.8→5.2, WBC 12.8→9.6" },
              { id: "c", label: "Image / Procedure", value: "ENBD 배액 양호" },
            ]),
            objectiveImages: "[]",
            objectivePe: "",
            objectiveLab: "",
            objectiveImageProcedure: "",
            objectiveDrain: "",
            assessment: "ERCP 후 담관 감압으로 임상/검사 호전. 항생제 지속.",
            planItems: JSON.stringify([
              { id: "d", label: "Dx", value: "내일 추적 LFT" },
              { id: "e", label: "Tx", value: "Ceftriaxone 유지, 수액 감량" },
              { id: "f", label: "Edu", value: "ENBD 관리 교육" },
            ]),
            planDx: "",
            planTx: "",
            planMonitoring: "",
            planEducation: "",
          },
          {
            progressStatus: "improving",
            titleSnapshot: "담석성 췌장염",
            subjective: "메스꺼움 호전",
            objectiveItems: JSON.stringify([
              { id: "g", label: "PE", value: "상복부 압통 경미" },
              { id: "h", label: "Lab", value: "Lipase 410→180" },
            ]),
            objectiveImages: "[]",
            objectivePe: "",
            objectiveLab: "",
            objectiveImageProcedure: "",
            objectiveDrain: "",
            assessment: "경증 췌장염으로 식이 진행 가능.",
            planItems: JSON.stringify([
              { id: "i", label: "Dx", value: "통증/효소 추적" },
              { id: "j", label: "Tx", value: "미음 → 연식 진행" },
            ]),
            planDx: "",
            planTx: "",
            planMonitoring: "",
            planEducation: "",
          },
        ],
      },
      {
        date: "2026-06-21",
        hospitalDay: "HD#2 / ERCP day",
        vitals: JSON.stringify({ bt: "38.1", bp: "132/82", pr: "92", rr: "20", spo2: "97%" }),
        diet: "금식",
        io: "I 2600 / O 1700",
        overnightEvent: "ERCP 시행, 시술 후 경미한 복통",
        drainTube: "ENBD 삽입함",
        problems: [
          {
            progressStatus: "active",
            titleSnapshot: "담석성 담관염",
            subjective: "시술 후 복부 불편감",
            objectiveItems: JSON.stringify([
              { id: "k", label: "PE", value: "RUQ 압통 지속" },
              { id: "l", label: "Lab", value: "T.bil 4.8→5.2 (시술 직후)" },
            ]),
            objectiveImages: "[]",
            objectivePe: "",
            objectiveLab: "",
            objectiveImageProcedure: "",
            objectiveDrain: "",
            assessment: "ERCP로 담관 결석 제거 및 감압 시행. 경과 관찰.",
            planItems: JSON.stringify([{ id: "m", label: "Tx", value: "항생제 지속, 금식 유지" }]),
            planDx: "",
            planTx: "",
            planMonitoring: "",
            planEducation: "",
          },
        ],
      },
    ],
  };
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
}

function runBrowser(browser, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code));
  });
}

async function renderPdf(browser) {
  const fileUrl = pathToFileURL(HTML_PATH).href;
  await runBrowser(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    `--print-to-pdf=${PDF_PATH}`,
    fileUrl,
  ]);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { render, close } = await loadRenderer();
  let html;
  try {
    html = render(sampleCase(), { includeBranding: true, includeFooter: true });
  } finally {
    await close();
  }
  fs.writeFileSync(HTML_PATH, html, "utf8");
  console.log(`HTML -> ${path.relative(ROOT, HTML_PATH)}`);

  const browser = findBrowser();
  if (!browser) {
    console.warn(
      "No Chromium browser found — wrote HTML only. Set CHROME_PATH to a Chrome/Edge binary to also produce report-sample.pdf.",
    );
    return;
  }
  await renderPdf(browser);
  console.log(`PDF  -> ${path.relative(ROOT, PDF_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
