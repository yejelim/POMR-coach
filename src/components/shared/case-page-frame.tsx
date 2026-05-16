import type { ReactNode } from "react";
import { CaseHeader } from "@/components/shared/case-header";
import { MobileWorkflowNav, WorkflowNav } from "@/components/shared/workflow-nav";

export function CasePageFrame({
  caseId,
  title,
  department,
  status,
  tags,
  updatedAt,
  userEmail,
  isLocalFallback,
  active,
  children,
}: {
  caseId: string;
  title: string;
  department: string;
  status: string;
  tags: string[];
  updatedAt?: Date | string;
  userEmail?: string;
  isLocalFallback?: boolean;
  active: Parameters<typeof WorkflowNav>[0]["active"];
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-app-bg">
      <WorkflowNav caseId={caseId} active={active} />
      <div className="min-w-0 flex-1">
        <CaseHeader
          caseId={caseId}
          title={title}
          department={department}
          status={status}
          tags={tags}
          updatedAt={updatedAt}
          userEmail={userEmail}
          isLocalFallback={isLocalFallback}
        />
        <MobileWorkflowNav caseId={caseId} active={active} />
        <section className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</section>
      </div>
    </main>
  );
}
