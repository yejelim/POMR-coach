import { notFound } from "next/navigation";
import { saveImpressionsAction } from "@/app/cases/actions";
import { getImpressionCaseForOwner } from "@/server/services/case-service";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";
import { CasePageFrame } from "@/components/shared/case-page-frame";
import { ImpressionTable } from "@/features/impressions/impression-table";
import { workflowNav } from "@/lib/workflow";

export default async function FinalImpressionPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await requireCurrentUser();
  const ownerId = ownerIdForQuery(user);
  const caseRecord = await getImpressionCaseForOwner(caseId, "FINAL", ownerId);
  if (!caseRecord) notFound();
  const nav = workflowNav(caseRecord.id, "final");

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
      active="final"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Post-test Final Impression</h2>
      </div>
      <ImpressionTable
        stage="FINAL"
        rows={caseRecord.impressionRows
          .filter((row) => row.stage === "FINAL")
          .map((row) => ({
            id: row.id,
            rank: row.rank,
            title: row.title,
            evidence: row.evidence,
            evidenceAgainst: row.evidenceAgainst,
            missingData: row.missingData,
            dxPlan: row.dxPlan,
            txPlan: row.txPlan,
          }))}
        action={saveImpressionsAction.bind(null, caseRecord.id, "FINAL")}
        {...nav}
      />
    </CasePageFrame>
  );
}
