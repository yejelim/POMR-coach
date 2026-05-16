import { notFound } from "next/navigation";
import { saveProblemsAction } from "@/app/cases/actions";
import { getCaseBundleForOwner, listAiReviewsForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { CoachingNote } from "@/components/shared/coaching-note";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ProblemListEditor } from "@/features/problems/problem-list-editor";
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
  const caseRecord = await getCaseBundleForOwner(caseId, ownerId);
  if (!caseRecord) notFound();
  const reviews = await listAiReviewsForOwner(caseRecord.id, "PROBLEM_LIST", undefined, ownerId);
  const finalImpressions = caseRecord.impressionRows.filter((row) => row.stage === "FINAL");
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
      active="problems"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Problem List Draft</h2>
      </div>
      {!caseRecord.problems.length ? (
        <CoachingNote>
          AI 제안을 보기 전에, 먼저 이 환자의 problem list를 직접 정의해보세요.
        </CoachingNote>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
        <AiFeedbackPanel caseId={caseRecord.id} reviewType="PROBLEM_LIST" history={reviews} />
      </div>
    </CasePageFrame>
  );
}
