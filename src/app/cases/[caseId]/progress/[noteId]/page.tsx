import { notFound } from "next/navigation";
import { saveProgressNoteAction } from "@/app/cases/actions";
import { getProgressNoteForOwner, listAiReviewsForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { AiFeedbackPanel } from "@/features/ai/ai-feedback-panel";
import { ProgressNoteEditor } from "@/features/progress/progress-note-editor";
import { workflowNav } from "@/lib/workflow";
import type { SoapSubfield, UploadedImage, Vitals } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";

export default async function ProgressNotePage({
  params,
}: {
  params: Promise<{ caseId: string; noteId: string }>;
}) {
  const { caseId, noteId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const note = await getProgressNoteForOwner(noteId, ownerId);
  if (!note || note.caseId !== caseId) notFound();
  const reviews = await listAiReviewsForOwner(caseId, "SOAP_ASSESSMENT", noteId, ownerId);
  const nav = {
    currentHref: `/cases/${caseId}/progress/${note.id}`,
    previousHref: workflowNav(caseId, "progress").currentHref,
    nextHref: workflowNav(caseId, "export").currentHref,
  };

  return (
    <CasePageFrame
      caseId={caseId}
      title={note.case.title}
      department={note.case.department}
      status={note.case.status}
      tags={note.case.tags.map((tag) => tag.name)}
      updatedAt={note.updatedAt}
      userEmail={user.email}
      isLocalFallback={user.isLocalFallback}
      isAnonymous={user.isAnonymous}
      active="progress"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Progress Note SOAP</h2>
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
              objectiveItems: parseStoredJson<SoapSubfield[]>(problem.objectiveItems, []),
              objectiveImages: parseStoredJson<UploadedImage[]>(problem.objectiveImages, []),
              objectivePe: problem.objectivePe,
              objectiveLab: problem.objectiveLab,
              objectiveImageProcedure: problem.objectiveImageProcedure,
              objectiveDrain: problem.objectiveDrain,
              assessment: problem.assessment,
              planItems: parseStoredJson<SoapSubfield[]>(problem.planItems, []),
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
          currentHref={nav.currentHref}
          previousHref={nav.previousHref}
          nextHref={nav.nextHref}
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
