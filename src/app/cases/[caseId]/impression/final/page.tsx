import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { getImpressionCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ImpressionTable } from "@/features/impressions/impression-table";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import { workflowNav } from "@/lib/workflow";

export default async function FinalImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const caseRecord = await getImpressionCaseForOwner(caseId, "FINAL", ownerId);
  if (!caseRecord) notFound();
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
      isAnonymous={user.isAnonymous}
      active="final"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Post-test Final Impression</h2>
      </div>
      <WorkflowGuidanceNote
        title="새 정보를 반영해 impression과 plan을 업데이트하는 단계"
        points={[
          "Final impression이 확정 전이라면 어떤 검사가 더 필요한지 씁니다.",
          "Plan은 Diagnosis, Treatment, Education 관점에서 명료하게 세우는 연습을 합니다.",
        ]}
      >
        좋은 plan은 진단을 어떻게 확인할지, 지금 어떤 치료를 시작할지, 환자에게 무엇을
        설명할지까지 포함합니다. Lab과 image 이후 reasoning이 어떻게 바뀌었는지 드러나게
        정리해보세요.
      </WorkflowGuidanceNote>
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
    </CasePageFrame>
  );
}
