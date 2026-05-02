import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { listAiReviews, getCaseBundle } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ImpressionTable } from "@/features/impressions/impression-table";

export default async function InitialImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();
  const reviews = await listAiReviews(caseRecord.id, "INITIAL_IMPRESSION");

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      active="initial"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Pre-test Initial Impression</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Rank DDx from interview, ROS, and PE before reviewing lab/image/procedure data.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ImpressionTable
          stage="INITIAL"
          rows={caseRecord.impressionRows
            .filter((row) => row.stage === "INITIAL")
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
          action={saveImpressionsAction.bind(null, caseRecord.id, "INITIAL")}
        />
        <AiFeedbackPanel
          caseId={caseRecord.id}
          reviewType="INITIAL_IMPRESSION"
          history={reviews}
        />
      </div>
    </CasePageFrame>
  );
}
