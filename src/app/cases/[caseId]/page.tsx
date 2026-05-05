import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCaseAction } from "@/app/cases/actions";
import { genericTemplate } from "@/config/templates/generic";
import { getCaseBundle } from "@/server/services/case-service";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { SaveBar } from "@/components/shared/save-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workflowNav } from "@/lib/workflow";

const workflowCards = [
  ["Timeline Scratchpad", "Informal EHR review and uncertainty tracking.", "timeline"],
  ["Admission Workspace", "CC, HPI, histories, ROS, PE, vitals, text findings.", "admission"],
  ["Pre-test Initial Impression", "Ranked DDx before labs/images/procedures.", "impression/initial"],
  ["Lab / Image / Procedure Data", "Editable lab table and official text findings.", "data"],
  ["Post-test Final Impression", "Revised ranked impression after data.", "impression/final"],
  ["Problem List Draft", "Prioritized active/background problems for SOAP.", "problems"],
  ["Daily Progress SOAP", "Problem-based progress note writing.", "progress"],
  ["Submission PDF Export", "Submission-oriented printable output.", "export"],
] as const;

export default async function CaseOverviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseRecord = await getCaseBundle(caseId);
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
      active="overview"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          {workflowCards.map(([title, description, path]) => (
            <Link
              key={path}
              href={`/cases/${caseRecord.id}/${path}`}
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
                <Select name="department" defaultValue={caseRecord.department}>
                  {genericTemplate.departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <Select name="status" defaultValue={caseRecord.status}>
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                </Select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Tags</span>
                <Input name="tags" defaultValue={caseRecord.tags.map((tag) => tag.name).join(", ")} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Short summary</span>
                <Textarea name="summary" defaultValue={caseRecord.summary} rows={5} />
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge>Educational only</Badge>
                <Badge>No PHI</Badge>
                <Badge>Local SQLite</Badge>
              </div>
              <SaveBar label="Save settings" {...nav} />
            </form>
          </CardContent>
        </Card>
      </div>
    </CasePageFrame>
  );
}
