import { notFound } from "next/navigation";
import { saveTimelineAction } from "@/app/cases/actions";
import { getCaseBundleForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { CoachingNote } from "@/components/shared/coaching-note";
import { TimelineEditor } from "@/features/timeline/timeline-editor";
import { workflowNav } from "@/lib/workflow";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getCaseBundleForOwner(caseId, ownerIdForQuery(user));
  if (!caseRecord) notFound();
  const nav = workflowNav(caseRecord.id, "timeline");

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
      active="timeline"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Timeline Scratchpad</h2>
      </div>
      {!caseRecord.timelineEntries.length ? (
        <CoachingNote>
          환자의 이야기를 시간순으로 재구성해보세요. EHR, 환자 문진, 입원 경과에서
          중요한 사건을 추가할 수 있습니다.
        </CoachingNote>
      ) : null}
      <TimelineEditor
        entries={caseRecord.timelineEntries.map((entry) => ({
          id: entry.id,
          timepoint: entry.timepoint,
          event: entry.event,
          interpretation: entry.interpretation,
          question: entry.question,
        }))}
        action={saveTimelineAction.bind(null, caseRecord.id)}
        {...nav}
      />
    </CasePageFrame>
  );
}
