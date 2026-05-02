import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { getCaseBundle, listAiReviews } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ImpressionTable } from "@/features/impressions/impression-table";

export default async function FinalImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();
  const reviews = await listAiReviews(caseRecord.id, "FINAL_IMPRESSION");

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      active="final"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Post-test Final Impression</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Revise ranked impressions after labs, image reports, and procedure findings.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ImpressionTable
          stage="FINAL"
          rows={caseRecord.impressionRows
            .filter((row) => row.stage === "FINAL")
            .map((row) => ({
              id: row.id,
              rank: row.rank,
              title: row.title,
              evidence: row.evidence,
              evidenceAgainst: row.evidenceAgainst,
              missingData: row.missingData,
              dxPlan: row.dxPlan,
              txPlan: row.txPlan,
            }))}
          action={saveImpressionsAction.bind(null, caseRecord.id, "FINAL")}
        />
        <AiFeedbackPanel
          caseId={caseRecord.id}
          reviewType="FINAL_IMPRESSION"
          history={reviews}
        />
      </div>
    </CasePageFrame>
  );
}
