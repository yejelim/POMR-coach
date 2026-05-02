import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { renderSubmissionHtml } from "@/export/templates/submission-html";
import { getCaseBundle } from "@/server/services/case-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) {
    return NextResponse.json({ message: "Case not found." }, { status: 404 });
  }

  const html = renderSubmissionHtml(caseRecord);

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" },
    });
    await browser.close();

    const body = new Uint8Array(pdf).buffer;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${caseRecord.title.replace(/[^a-z0-9_-]+/gi, "_") || "pomr_case"}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(html, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-POMR-Coach-Fallback": "playwright-pdf-unavailable",
      },
    });
  }
}
