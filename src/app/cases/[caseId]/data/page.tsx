import { notFound } from "next/navigation";
import { saveDiagnosticDataAction } from "@/app/cases/actions";
import { getDiagnosticCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { normalizeLabTable } from "@/ai/serializers/labTableToText";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { SaveBar } from "@/components/shared/save-bar";
import { SectionTextarea } from "@/components/shared/section-textarea";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
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
  const user = await requireCurrentUser();
  const caseRecord = await getDiagnosticCaseForOwner(caseId, ownerIdForQuery(user));
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
      userEmail={user.email}
      isLocalFallback={user.isLocalFallback}
      isAnonymous={user.isAnonymous}
      active="data"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Lab / Image / Procedure Data</h2>
      </div>
      <WorkflowGuidanceNote
        title="처음 세운 impression을 지지하거나 반박하는 정보"
        points={[
          "xlsx import 후 불필요한 row/column은 지우고 필요한 값만 남깁니다.",
          "High/Low 표시, PACS 캡처 이미지, report text를 export 문서에 반영할 수 있습니다.",
        ]}
      >
        Lab, image, procedure 결과는 initial impression을 검증하는 새 input입니다. 어떤 결과가
        DDx를 강화하고, 어떤 결과가 다른 가능성을 낮추는지 summary에 짧게 해석해보세요.
      </WorkflowGuidanceNote>
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
