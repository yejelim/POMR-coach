import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { getCaseBundleForOwner, listAiReviewsForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ImpressionTable } from "@/features/impressions/impression-table";
import { workflowNav } from "@/lib/workflow";

export default async function FinalImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const caseRecord = await getCaseBundleForOwner(caseId, ownerId);
  if (!caseRecord) notFound();
  const reviews = await listAiReviewsForOwner(caseRecord.id, "FINAL_IMPRESSION", undefined, ownerId);
  const nav = workflowNav(caseRecord.id, "final");

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
      active="final"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Post-test Final Impression</h2>
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
          {...nav}
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
