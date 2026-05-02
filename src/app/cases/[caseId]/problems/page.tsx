import { notFound } from "next/navigation";
import { saveProblemsAction } from "@/app/cases/actions";
import { getCaseBundle, listAiReviews } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ProblemListEditor } from "@/features/problems/problem-list-editor";
import type { ProblemStatus } from "@/lib/types";

export default async function ProblemsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();
  const reviews = await listAiReviews(caseRecord.id, "PROBLEM_LIST");
  const finalImpressions = caseRecord.impressionRows.filter((row) => row.stage === "FINAL");

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      active="problems"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Problem List Draft</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Define active/background problems before daily SOAP. AI feedback appears only after your draft exists.
        </p>
      </div>
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
        />
        <AiFeedbackPanel caseId={caseRecord.id} reviewType="PROBLEM_LIST" history={reviews} />
      </div>
    </CasePageFrame>
  );
}
