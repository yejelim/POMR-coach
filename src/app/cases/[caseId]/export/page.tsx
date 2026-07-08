import { notFound } from "next/navigation";
import { getCaseBundleForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { renderSubmissionHtml } from "@/export/templates/submission-html";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ExportPreview } from "@/features/export/export-preview";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getCaseBundleForOwner(caseId, ownerIdForQuery(user));
  if (!caseRecord) notFound();
  const reverseChronological = renderExportHtmlVariants(caseRecord, false);
  const chronological = renderExportHtmlVariants(caseRecord, true);

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      updatedAt={caseRecord.updatedAt}
      userEmail={user.email}
      isLocalFallback={user.isLocalFallback}
      isAnonymous={user.isAnonymous}
      active="export"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-app-text">Submission PDF Export</h2>
      </div>
      <ExportPreview
        html={{
          reverseChronological,
          chronological,
        }}
      />
    </CasePageFrame>
  );
}

type ExportCaseRecord = NonNullable<Awaited<ReturnType<typeof getCaseBundleForOwner>>>;

function renderExportHtmlVariants(caseRecord: ExportCaseRecord, progressChronological: boolean) {
  return {
    brandedFooter: renderSubmissionHtml(caseRecord, {
      includeBranding: true,
      includeFooter: true,
      progressChronological,
    }),
    branded: renderSubmissionHtml(caseRecord, {
      includeBranding: true,
      includeFooter: false,
      progressChronological,
    }),
    footer: renderSubmissionHtml(caseRecord, {
      includeBranding: false,
      includeFooter: true,
      progressChronological,
    }),
    plain: renderSubmissionHtml(caseRecord, {
      includeBranding: false,
      includeFooter: false,
      progressChronological,
    }),
  };
}
