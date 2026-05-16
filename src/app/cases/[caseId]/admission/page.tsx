import { notFound } from "next/navigation";
import { saveAdmissionAction } from "@/app/cases/actions";
import { getCaseBundle } from "@/server/services/case-service";
import { genericTemplate } from "@/config/templates/generic";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { SaveBar } from "@/components/shared/save-bar";
import { SectionTextarea } from "@/components/shared/section-textarea";
import { VitalsEditor } from "@/components/shared/vitals-editor";
import type { Vitals } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";
import { workflowNav } from "@/lib/workflow";

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
  if (!caseRecord) notFound();

  const admission = caseRecord.admissionNote;
  const nav = workflowNav(caseRecord.id, "admission");

  return (
    <CasePageFrame
      caseId={caseRecord.id}
      title={caseRecord.title}
      department={caseRecord.department}
      status={caseRecord.status}
      tags={caseRecord.tags.map((tag) => tag.name)}
      updatedAt={caseRecord.updatedAt}
      active="admission"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Admission Workspace</h2>
      </div>
      <form action={saveAdmissionAction.bind(null, caseRecord.id)} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4">
        <section>
          <h3 className="mb-3 text-base font-semibold">Initial vital signs</h3>
          <VitalsEditor values={parseStoredJson<Vitals>(admission?.initialVitals, {})} />
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          {genericTemplate.admissionSections.map(([name, label]) => (
            <SectionTextarea
              key={name}
              name={name}
              label={label}
              defaultValue={admission?.[name] ?? ""}
              rows={name === "hpi" || name === "physicalExam" ? 8 : 4}
            />
          ))}
        </div>
        <SaveBar label="Save admission" {...nav} />
      </form>
    </CasePageFrame>
  );
}
