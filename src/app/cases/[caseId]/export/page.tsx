import { notFound } from "next/navigation";
import { getCaseShellForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ExportPreview } from "@/features/export/export-preview";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const caseRecord = await getCaseShellForOwner(caseId, ownerIdForQuery(user));
  if (!caseRecord) notFound();

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
      active="export"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-app-text">Submission PDF Export</h2>
      </div>
      <ExportPreview caseId={caseRecord.id} />
    </CasePageFrame>
  );
}
