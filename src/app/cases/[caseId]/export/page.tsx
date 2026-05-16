import { notFound } from "next/navigation";
import { getCaseBundle } from "@/server/services/case-service";
import { renderSubmissionHtml } from "@/export/templates/submission-html";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ExportPreview } from "@/features/export/export-preview";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      updatedAt={caseRecord.updatedAt}
      active="export"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-app-text">Submission PDF Export</h2>
      </div>
      <ExportPreview
        caseId={caseRecord.id}
        html={{
          brandedFooter: renderSubmissionHtml(caseRecord, {
            includeBranding: true,
            includeFooter: true,
          }),
          branded: renderSubmissionHtml(caseRecord, {
            includeBranding: true,
            includeFooter: false,
          }),
          footer: renderSubmissionHtml(caseRecord, {
            includeBranding: false,
            includeFooter: true,
          }),
          plain: renderSubmissionHtml(caseRecord, {
            includeBranding: false,
            includeFooter: false,
          }),
        }}
      />
    </CasePageFrame>
  );
}
