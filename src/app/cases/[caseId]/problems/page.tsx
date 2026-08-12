import { notFound } from "next/navigation";
import { saveProblemsAction } from "@/app/cases/actions";
import { getProblemsCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ProblemListEditor } from "@/features/problems/problem-list-editor";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import type { ProblemStatus } from "@/lib/types";
import { workflowNav } from "@/lib/workflow";

export default async function ProblemsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const caseRecord = await getProblemsCaseForOwner(caseId, ownerId);
  if (!caseRecord) notFound();
  const finalImpressions = caseRecord.impressionRows;
  const nav = workflowNav(caseRecord.id, "problems");

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
      active="problems"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Problem List Draft</h2>
      </div>
      <WorkflowGuidanceNote
        title="병동에서 추적할 문제를 명료하게 정의하는 단계"
        points={[
          "입원 전부터 있던 background problem과 현재 active problem을 구분합니다.",
          "Progress SOAP는 이 problem list를 기준으로 날짜별 변화를 추적합니다.",
        ]}
      >
        복잡한 임상상에서 문제를 잘 나누고 우선순위를 정하는 것은 중요한 의사의 역량입니다.
        Final impression을 바탕으로 이 환자에게 실제로 추적해야 할 problem을 먼저 정의하세요.
      </WorkflowGuidanceNote>
      <ProblemListEditor
        rows={caseRecord.problems.map((problem) => ({
          id: problem.id,
          priority: problem.priority,
          title: problem.title,
          status: problem.status as ProblemStatus,
          evidence: problem.evidence,
          linkedImpressionRowId: problem.linkedImpressionRowId ?? "",
          notes: problem.notes,
        }))}
        finalImpressions={finalImpressions.map((row) => ({
          id: row.id,
          rank: row.rank,
          title: row.title,
        }))}
        action={saveProblemsAction.bind(null, caseRecord.id)}
        {...nav}
      />
    </CasePageFrame>
  );
}
