import { notFound } from "next/navigation";
import { FileX2 } from "lucide-react";
import { saveTimelineAction } from "@/app/cases/actions";
import { getTimelineCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { TimelineEditor } from "@/features/timeline/timeline-editor";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import { workflowNav } from "@/lib/workflow";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getTimelineCaseForOwner(caseId, ownerIdForQuery(user));
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
      isAnonymous={user.isAnonymous}
      active="timeline"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Timeline Memo</h2>
      </div>
      <WorkflowGuidanceNote title="EHR을 보며 빠르게 맥락을 잡는 메모 공간">
        모든 케이스를 완성형 POMR로 만들 필요는 없습니다. 외래, 협진, 간단한 follow-up
        케이스는 중요한 사건과 질문만 메모해도 나중에 검색하고 복기하는 데 충분합니다.
      </WorkflowGuidanceNote>
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-app-accent/20 bg-app-accent-soft/45 px-4 py-3 text-sm text-app-text-secondary">
        <FileX2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" aria-hidden="true" />
        <p>
          <strong className="font-semibold text-app-text">Timeline은 개인 scratchpad입니다.</strong>{" "}
          제출용 PDF에는 포함되지 않으니 EHR 검토 메모를 자유롭게 작성해도 됩니다.
        </p>
      </div>
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
