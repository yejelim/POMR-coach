import { NextResponse } from "next/server";
import { renderSubmissionHtml } from "@/export/templates/submission-html";
import { getCaseBundleForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getCaseBundleForOwner(caseId, ownerIdForQuery(user));
  if (!caseRecord) {
    return NextResponse.json({ message: "Case not found." }, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;
  const html = renderSubmissionHtml(caseRecord, {
    includeBranding: searchParams.get("branding") !== "0",
    includeFooter: searchParams.get("footer") !== "0",
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${caseRecord.title.replace(/[^a-z0-9_-]+/gi, "_") || "pomr_case"}.html"`,
      "X-POMR-Coach-Export": "html-print",
    },
  });
}
