import { notFound } from "next/navigation";
import { saveProgressNoteAction } from "@/app/cases/actions";
import { getProgressNote, listAiReviews } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ProgressNoteEditor } from "@/features/progress/progress-note-editor";
import type { Vitals } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";

export default async function ProgressNotePage({
  params,
}: {
  params: Promise<{ caseId: string; noteId: string }>;
}) {
  const { caseId, noteId } = await params;
  const note = await getProgressNote(noteId);
  if (!note || note.caseId !== caseId) notFound();
  const reviews = await listAiReviews(caseId, "SOAP_ASSESSMENT", noteId);

  return (
    <CasePageFrame
      caseId={caseId}
      title={note.case.title}
      department={note.case.department}
      status={note.case.status}
      tags={note.case.tags.map((tag) => tag.name)}
      updatedAt={note.updatedAt}
      active="progress"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Progress Note SOAP</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Write the Assessment first in your own words, then request focused feedback.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <ProgressNoteEditor
          note={{
            date: note.date,
            hospitalDay: note.hospitalDay,
            vitals: parseStoredJson<Vitals>(note.vitals, {}),
            diet: note.diet,
            io: note.io,
            overnightEvent: note.overnightEvent,
            drainTube: note.drainTube,
            problems: note.problems.map((problem) => ({
              id: problem.id,
              problemId: problem.problemId ?? "",
              titleSnapshot: problem.titleSnapshot,
              subjective: problem.subjective,
              objectivePe: problem.objectivePe,
              objectiveLab: problem.objectiveLab,
              objectiveImageProcedure: problem.objectiveImageProcedure,
              objectiveDrain: problem.objectiveDrain,
              assessment: problem.assessment,
              planDx: problem.planDx,
              planTx: problem.planTx,
              planMonitoring: problem.planMonitoring,
              planEducation: problem.planEducation,
            })),
          }}
          problems={note.case.problems.map((problem) => ({
            id: problem.id,
            priority: problem.priority,
            title: problem.title,
          }))}
          action={saveProgressNoteAction.bind(null, caseId, note.id)}
        />
        <AiFeedbackPanel
          caseId={caseId}
          reviewType="SOAP_ASSESSMENT"
          targetId={note.id}
          history={reviews}
        />
      </div>
    </CasePageFrame>
  );
}
