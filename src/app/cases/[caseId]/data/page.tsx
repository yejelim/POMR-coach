import { notFound } from "next/navigation";
import { saveDiagnosticDataAction } from "@/app/cases/actions";
import { getCaseBundle } from "@/server/services/case-service";
import { normalizeLabTable } from "@/ai/serializers/labTableToText";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { SaveBar } from "@/components/shared/save-bar";
import { SectionTextarea } from "@/components/shared/section-textarea";
import { DiagnosticImageSection } from "@/features/diagnostics/diagnostic-image-section";
import { LabTableEditor } from "@/features/diagnostics/lab-table-editor";
import type { UploadedImage } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";
import { workflowNav } from "@/lib/workflow";

export default async function DiagnosticDataPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();

  const data = caseRecord.diagnosticData;
  const nav = workflowNav(caseRecord.id, "data");

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      updatedAt={caseRecord.updatedAt}
      active="data"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Lab / Image / Procedure Data</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter lab tables, official text reports, and de-identified images for export. MVP does not interpret images.
        </p>
      </div>
      <form action={saveDiagnosticDataAction.bind(null, caseRecord.id)} className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold">Lab table</h3>
          <LabTableEditor table={normalizeLabTable(data?.labTable)} />
        </section>
        <DiagnosticImageSection
          images={parseStoredJson<UploadedImage[]>(data?.imageAttachments, [])}
        />
        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
          <SectionTextarea
            name="imageFindingsText"
            label="Image findings text"
            defaultValue={data?.imageFindingsText ?? ""}
            rows={6}
          />
          <SectionTextarea
            name="procedureFindingsText"
            label="Procedure findings text"
            defaultValue={data?.procedureFindingsText ?? ""}
            rows={6}
          />
          <div className="md:col-span-2">
            <SectionTextarea
              name="summaryText"
              label="Lab / image / procedure summary"
              defaultValue={data?.summaryText ?? ""}
              rows={5}
            />
          </div>
        </section>
        <SaveBar label="Save data" {...nav} />
      </form>
    </CasePageFrame>
  );
}
