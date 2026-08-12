import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCaseAction } from "@/app/cases/actions";
import { genericTemplate } from "@/config/templates/generic";
import { getCaseShellForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { SaveBar } from "@/components/shared/save-bar";
import { WorkflowGuidanceNote } from "@/components/shared/workflow-guidance-note";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workflowNav } from "@/lib/workflow";

const workflowCards = [
  ["Timeline Scratchpad", "시간순 사건 정리", "timeline"],
  ["Admission Workspace", "입원 정보 정리", "admission"],
  ["Pre-test Initial Impression", "검사 전 DDx", "impression/initial"],
  ["Lab / Image / Procedure Data", "검사와 이미지 자료", "data"],
  ["Post-test Final Impression", "검사 후 impression", "impression/final"],
  ["Problem List Draft", "SOAP 전 problem 정리", "problems"],
  ["Daily Progress SOAP", "날짜별 progress note", "progress"],
  ["Submission PDF Export", "제출용 PDF", "export"],
] as const;

export default async function CaseOverviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getCaseShellForOwner(caseId, ownerIdForQuery(user));
  if (!caseRecord) notFound();
  const nav = workflowNav(caseRecord.id, "overview");

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
      active="overview"
    >
      <WorkflowGuidanceNote
        title="POMR Coach가 훈련하려는 것"
        points={[
          "Admission은 진단을 위한 초기 database입니다.",
          "Initial impression은 검사 전 감별진단을 먼저 세우는 훈련입니다.",
          "Data는 처음 추론을 지지하거나 반박하는 새 정보입니다.",
          "Problem list는 병동에서 추적할 문제를 명료하게 정의하는 단계입니다.",
        ]}
      >
        POMR은 정답을 한 번에 맞히는 문서가 아니라, 정보가 쌓이는 순서대로 추론을
        업데이트하는 사고 기록입니다. 먼저 직접 쓰고, 새 정보가 들어오면 impression과
        plan을 다시 정리해보세요.
      </WorkflowGuidanceNote>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          {workflowCards.map(([title, description, path]) => (
            <Link
              key={path}
              href={`/cases/${caseRecord.id}/${path}`}
              prefetch={false}
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <h2 className="font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </Link>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Case settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateCaseAction.bind(null, caseRecord.id)} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <Input name="title" defaultValue={caseRecord.title} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Department</span>
                <Input
                  name="department"
                  defaultValue={caseRecord.department}
                  list="department-suggestions"
                  placeholder="예: GI, Endocrinology, Surgery, 소화기내과"
                />
                <datalist id="department-suggestions">
                  {genericTemplate.departments.map((department) => (
                    <option key={department} value={department} />
                  ))}
                </datalist>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <Select name="status" defaultValue={caseRecord.status}>
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                </Select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Short summary</span>
                <Textarea name="summary" defaultValue={caseRecord.summary} rows={5} />
              </label>
              <SaveBar label="Save settings" {...nav} />
            </form>
          </CardContent>
        </Card>
      </div>
    </CasePageFrame>
  );
}
