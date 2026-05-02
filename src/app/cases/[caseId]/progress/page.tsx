import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { createProgressNoteAction } from "@/app/cases/actions";
import { getCaseBundle } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { Button } from "@/components/ui/button";

export default async function ProgressNotesPage({
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
      updatedAt={caseRecord.updatedAt}
      active="progress"
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Daily Progress Note SOAP</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Problem-based daily progress notes with shared vitals and events.
          </p>
        </div>
        <form action={createProgressNoteAction.bind(null, caseRecord.id)}>
          <Button type="submit">
            <Plus className="h-4 w-4" />
            New progress note
          </Button>
        </form>
      </div>
      <div className="grid gap-3">
        {caseRecord.progressNotes.map((note) => (
          <Link
            key={note.id}
            href={`/cases/${caseRecord.id}/progress/${note.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-950">{note.date || "Undated progress note"}</h3>
              <span className="text-sm text-slate-500">{note.hospitalDay || "HD not set"}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{note.problems.length} SOAP problem(s)</p>
          </Link>
        ))}
        {!caseRecord.progressNotes.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">No progress notes yet.</p>
          </div>
        ) : null}
      </div>
    </CasePageFrame>
  );
}
