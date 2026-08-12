import { notFound } from "next/navigation";
import { getCaseShellForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import { ExportPreview } from "@/features/export/export-preview";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getCaseShellForOwner(caseId, ownerIdForQuery(user));
  if (!caseRecord) notFound();

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
      <WorkflowGuidanceNote title="공부하며 작성한 내용을 제출용 문서로 정리하는 단계">
        Timeline 메모와 AI feedback은 제외하고, Admission, Impression, Data, Problems,
        Progress SOAP만 제출용 형식으로 모읍니다. 내보내기 전 환자 식별정보가 들어가지
        않았는지 마지막으로 확인하세요.
      </WorkflowGuidanceNote>
      <ExportPreview caseId={caseRecord.id} />
    </CasePageFrame>
  );
}
