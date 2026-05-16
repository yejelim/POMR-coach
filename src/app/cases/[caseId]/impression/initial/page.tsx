import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { getCaseBundleForOwner, listAiReviewsForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { CoachingNote } from "@/components/shared/coaching-note";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ImpressionTable } from "@/features/impressions/impression-table";
import { workflowNav } from "@/lib/workflow";

export default async function InitialImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const caseRecord = await getCaseBundleForOwner(caseId, ownerId);
  if (!caseRecord) notFound();
  const reviews = await listAiReviewsForOwner(caseRecord.id, "INITIAL_IMPRESSION", undefined, ownerId);
  const nav = workflowNav(caseRecord.id, "initial");

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
      active="initial"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Pre-test Initial Impression</h2>
      </div>
      {!caseRecord.impressionRows.some((row) => row.stage === "INITIAL") ? (
        <CoachingNote>
          검사 결과를 모두 보기 전에, 문진과 신체진찰을 바탕으로 initial impression을
          먼저 작성해보세요.
        </CoachingNote>
      ) : null}
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
          {...nav}
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
