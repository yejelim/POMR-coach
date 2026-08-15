import { notFound } from "next/navigation";
import { saveAdmissionAction } from "@/app/cases/actions";
import { getAdmissionCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { genericTemplate } from "@/config/templates/generic";
import { defaultPhysicalExamText } from "@/config/templates/physical-exam";
import { rosTemplateGroups } from "@/config/templates/ros";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ClinicalFormRow, ClinicalFormTable, ClinicalSection } from "@/components/shared/clinical-form";
import { SaveBar } from "@/components/shared/save-bar";
import { VitalsEditor } from "@/components/shared/vitals-editor";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import { Textarea } from "@/components/ui/textarea";
import { PhysicalExamEditor } from "@/features/admission/physical-exam-editor";
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
      <WorkflowGuidanceNote
        title="진단을 위한 초기 database를 만드는 단계"
        points={[
          "문진, 계통문진(Review of systems), 신체진찰(Physical examination)은 initial impression의 질을 결정합니다.",
          "이전 검사 기록도 현재 문제를 이해하는 단서가 될 수 있습니다.",
        ]}
      >
        Admission은 환자가 치료를 시작하기 전의 정보를 최대한 모으는 공간입니다. 여기까지의
        정보만으로 먼저 first impression을 세운다고 생각하고 작성해보세요.
      </WorkflowGuidanceNote>
      <form action={saveAdmissionAction.bind(null, caseRecord.id)} className="space-y-5">
        <ClinicalSection
          title="문진 정보"
          eyebrow="Admission"
        >
          <div className="mb-5">
            <h4 className="mb-3 text-sm font-semibold text-app-text-secondary">
              초기 활력징후 <span className="ml-1 text-xs font-normal text-app-text-muted">Initial vital signs</span>
            </h4>
            <VitalsEditor
              values={parseStoredJson<Vitals>(admission?.initialVitals, {})}
              showAnthropometrics
            />
          </div>
          <ClinicalFormTable>
            {genericTemplate.admissionSections
              .filter(([name]) => name !== "ros" && name !== "physicalExam")
              .map(([name, label]) => {
                const [primaryLabel, secondaryLabel] = label.split(" / ");
                return (
                  <ClinicalFormRow
                    key={name}
                    label={primaryLabel}
                    hint={secondaryLabel}
                    className="md:grid-cols-[220px_minmax(0,1fr)]"
                  >
                    <Textarea
                      name={name}
                      defaultValue={admission?.[name] ?? ""}
                      rows={name === "hpi" ? 7 : 3}
                      className={name === "hpi" ? "min-h-40" : "min-h-20"}
                    />
                  </ClinicalFormRow>
                );
              })}
          </ClinicalFormTable>
        </ClinicalSection>
        <ClinicalSection
          title="계통문진 / Review of systems"
          description="양성 소견은 (+)로 표시하고 onset, NRS 등 필요한 메모만 남기세요."
          eyebrow="Patient interview"
        >
          <RosChecklistEditor groups={rosTemplateGroups} defaultValue={admission?.ros ?? ""} />
        </ClinicalSection>
        <ClinicalSection
          title="신체진찰 / Physical examination"
          description="필요한 finding만 남기고 수행하지 않은 검진은 삭제하세요."
          eyebrow="Exam"
        >
          <PhysicalExamEditor
            defaultValue={admission?.physicalExam?.trim() ? admission.physicalExam : defaultPhysicalExamText}
          />
        </ClinicalSection>
        <SaveBar label="Save admission" {...nav} />
      </form>
    </CasePageFrame>
  );
}
