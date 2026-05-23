import { notFound } from "next/navigation";
import { saveProblemsAction } from "@/app/cases/actions";
import { getProblemsCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { CoachingNote } from "@/components/shared/coaching-note";
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
      {!caseRecord.problems.length ? (
        <CoachingNote>
          이 환자의 active problem과 background problem을 직접 구분해보세요.
        </CoachingNote>
      ) : null}
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
