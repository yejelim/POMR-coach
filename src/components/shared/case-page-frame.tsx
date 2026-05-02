import type { ReactNode } from "react";
import { CaseHeader } from "@/components/shared/case-header";
import { WorkflowNav } from "@/components/shared/workflow-nav";

export function CasePageFrame({
  caseId,
  title,
  department,
  status,
  tags,
  active,
  children,
}: {
  caseId: string;
  title: string;
  department: string;
  status: string;
  tags: string[];
  active: Parameters<typeof WorkflowNav>[0]["active"];
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <CaseHeader title={title} department={department} status={status} tags={tags} />
      <WorkflowNav caseId={caseId} active={active} />
      <section className="mx-auto max-w-6xl px-4 py-6">{children}</section>
    </main>
  );
}
