import Link from "next/link";
import { FileDown } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { AuthStatus } from "@/components/shared/auth-status";
import { DeleteCaseButton } from "@/components/shared/delete-case-button";
import { SaveStatusBanner } from "@/components/shared/save-status-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CaseHeader({
  caseId,
  title,
  department,
  status,
  updatedAt,
  userEmail,
  isLocalFallback,
  isAnonymous,
}: {
  caseId: string;
  title: string;
  department: string;
  status: string;
  tags: string[];
  updatedAt?: Date | string;
  userEmail?: string | null;
  isLocalFallback?: boolean;
  isAnonymous?: boolean;
}) {
  return (
    <header className="no-print border-b border-app-border bg-app-surface/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 lg:hidden">
              <AppLogo size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-normal text-slate-950">
                {title}
              </h1>
              <Badge className="border-app-primary-soft bg-app-primary-muted text-app-primary">{department}</Badge>
              <StatusBadge status={status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
              {updatedAt ? <span>Last saved {new Date(updatedAt).toLocaleString()}</span> : null}
            </div>
            <SaveStatusBanner />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
            {userEmail || isLocalFallback || isAnonymous ? (
                <AuthStatus
                  email={userEmail ?? null}
                  isLocalFallback={Boolean(isLocalFallback)}
                  isAnonymous={Boolean(isAnonymous)}
                  variant="compact"
                />
            ) : null}
            <Button asChild variant="outline" className="h-9 shrink-0 px-3">
              <Link href={`/cases/${caseId}/export`} prefetch={false}>
                <FileDown className="h-4 w-4" />
                Export
              </Link>
            </Button>
            <DeleteCaseButton caseId={caseId} title={title} redirectHref="/cases" compact />
          </div>
        </div>
      </div>
    </header>
  );
}
