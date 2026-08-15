import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
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

const workflowSteps = [
  ["01", "맥락 파악", "Timeline Scratchpad", "EHR을 보며 중요한 사건을 빠르게 메모합니다.", "timeline"],
  ["02", "정보 수집", "Admission Workspace", "문진과 신체진찰로 초기 database를 만듭니다.", "admission"],
  ["03", "검사 전 추론", "Pre-test Initial Impression", "검사 결과를 보기 전 감별진단과 plan을 세웁니다.", "impression/initial"],
  ["04", "추가 정보", "Lab / Image / Procedure Data", "처음 추론을 지지하거나 반박하는 검사 자료를 모읍니다.", "data"],
  ["05", "추론 업데이트", "Post-test Final Impression", "새 정보를 반영해 최종 impression과 plan을 정리합니다.", "impression/final"],
  ["06", "문제 정의", "Problem List Draft", "병동에서 추적할 problem을 우선순위대로 정의합니다.", "problems"],
  ["07", "경과 추적", "Daily Progress SOAP", "날짜별 변화를 problem 중심 SOAP note로 기록합니다.", "progress"],
  ["08", "제출 문서", "Submission PDF Export", "작성한 내용만 모아 제출용 PDF를 확인합니다.", "export"],
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
        title="처음 이용하는 분들은 꼭 확인해주세요"
        defaultOpen
        points={[
          "Admission은 진단을 위한 초기 database입니다.",
          "Initial impression은 검사 전 감별진단을 먼저 세우는 훈련입니다.",
          "Data는 처음 추론을 지지하거나 반박하는 새 정보입니다.",
          "Problem list는 병동에서 추적할 문제를 명료하게 정의하는 단계입니다.",
        ]}
      >
        POMR Coach가 도와주는 임상추론 흐름입니다. POMR은 정답을 한 번에 맞히는 문서가
        아니라, 정보가 쌓이는 순서대로 추론을 업데이트하는 사고 기록입니다. 먼저 직접
        쓰고, 새 정보가 들어오면 impression과 plan을 다시 정리해보세요.
      </WorkflowGuidanceNote>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-xl border border-app-border bg-app-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="border-b border-app-border px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-app-text-faint">
              Clinical reasoning workflow
            </p>
            <h2 className="mt-1 text-base font-semibold text-app-text">케이스 작성 순서</h2>
          </div>
          <div className="divide-y divide-app-border">
            {workflowSteps.map(([number, phase, title, description, path]) => (
              <Link
                key={path}
                href={`/cases/${caseRecord.id}/${path}`}
                prefetch={false}
                className="group grid gap-3 px-4 py-3.5 transition-colors hover:bg-app-primary-muted/50 sm:grid-cols-[42px_92px_minmax(0,1fr)_28px] sm:items-center"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-surface-soft text-xs font-semibold text-app-text-muted group-hover:bg-app-primary group-hover:text-app-primary-contrast">
                  {number}
                </span>
                <span className="text-xs font-semibold text-app-primary">{phase}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-app-text">{title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-app-text-muted">{description}</span>
                </span>
                <ArrowRight className="hidden h-4 w-4 text-app-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-app-primary sm:block" />
              </Link>
            ))}
          </div>
        </section>
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
                  placeholder="예: Gastroenterology, Endocrinology, Surgery, 소화기내과"
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
