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
        <h2 className="text-xl font-semibold">Submission PDF Export</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Export excludes timeline scratchpad, AI feedback, flashcards, study notes, and reflection.
        </p>
      </div>
      <ExportPreview caseId={caseRecord.id} html={renderSubmissionHtml(caseRecord)} />
    </CasePageFrame>
  );
}
