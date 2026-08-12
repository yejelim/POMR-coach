import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { getImpressionCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ImpressionTable } from "@/features/impressions/impression-table";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import { workflowNav } from "@/lib/workflow";

export default async function InitialImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const caseRecord = await getImpressionCaseForOwner(caseId, "INITIAL", ownerId);
  if (!caseRecord) notFound();
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
      isAnonymous={user.isAnonymous}
      active="initial"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Pre-test Initial Impression</h2>
      </div>
      <WorkflowGuidanceNote
        title="검사 결과를 보기 전에 먼저 감별진단을 세우는 단계"
        points={[
          "Hx, ROS, PE에서 어떤 증거가 있는지 분리해서 적습니다.",
          "아직 모르는 정보와 확인할 검사 계획을 함께 남깁니다.",
        ]}
      >
        Initial impression은 이후 검사 선택의 출발점입니다. 지금까지 모은 정보만으로 가능한
        DDx를 ranked list로 정리하고, 각 가설을 어떻게 확인할지 생각해보세요.
      </WorkflowGuidanceNote>
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
    </CasePageFrame>
  );
}
