import { notFound } from "next/navigation";
import { saveAdmissionAction } from "@/app/cases/actions";
import { getAdmissionCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { genericTemplate } from "@/config/templates/generic";
import { defaultPhysicalExamText } from "@/config/templates/physical-exam";
import { rosTemplateGroups } from "@/config/templates/ros";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { SaveBar } from "@/components/shared/save-bar";
import { SectionTextarea } from "@/components/shared/section-textarea";
import { VitalsEditor } from "@/components/shared/vitals-editor";
import { Textarea } from "@/components/ui/textarea";
import { RosChecklistEditor } from "@/features/admission/ros-checklist-editor";
import type { Vitals } from "@/lib/types";
import { parseStoredJson } from "@/lib/utils";
import { workflowNav } from "@/lib/workflow";

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getAdmissionCaseForOwner(caseId, ownerIdForQuery(user));
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
      userEmail={user.email}
      isLocalFallback={user.isLocalFallback}
      isAnonymous={user.isAnonymous}
      active="admission"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Admission Workspace</h2>
      </div>
      <form action={saveAdmissionAction.bind(null, caseRecord.id)} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4">
        <section>
          <h3 className="mb-3 text-base font-semibold">Initial vital signs</h3>
          <VitalsEditor
            values={parseStoredJson<Vitals>(admission?.initialVitals, {})}
            showAnthropometrics
          />
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          {genericTemplate.admissionSections
            .filter(([name]) => name !== "ros" && name !== "physicalExam")
            .map(([name, label]) => (
              <SectionTextarea
                key={name}
                name={name}
                label={label}
                defaultValue={admission?.[name] ?? ""}
                rows={name === "hpi" ? 8 : 4}
              />
            ))}
          <RosChecklistEditor groups={rosTemplateGroups} defaultValue={admission?.ros ?? ""} />
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Physical examination</span>
            <p className="text-xs leading-5 text-app-text-muted">
              필요한 finding만 남겨 수정하세요. 수행하지 않은 검진이나 불필요한 normal finding은 삭제해도 됩니다.
            </p>
            <Textarea
              name="physicalExam"
              defaultValue={admission?.physicalExam?.trim() ? admission.physicalExam : defaultPhysicalExamText}
              rows={14}
            />
          </label>
        </div>
        <SaveBar label="Save admission" {...nav} />
      </form>
    </CasePageFrame>
  );
}
