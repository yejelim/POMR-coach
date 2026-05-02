import { notFound } from "next/navigation";
import { saveTimelineAction } from "@/app/cases/actions";
import { getCaseBundle } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { TimelineEditor } from "@/features/timeline/timeline-editor";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      active="timeline"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Timeline Scratchpad</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Informal reasoning space for EHR review. This section is excluded from submission PDF.
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
      />
    </CasePageFrame>
  );
}
