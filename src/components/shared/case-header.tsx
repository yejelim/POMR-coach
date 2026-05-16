import Link from "next/link";
import { FileDown } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { SaveStatusBanner } from "@/components/shared/save-status-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CaseHeader({
  caseId,
  title,
  department,
  status,
  tags,
  updatedAt,
}: {
  caseId: string;
  title: string;
  department: string;
  status: string;
  tags: string[];
  updatedAt?: Date | string;
}) {
  return (
    <header className="no-print border-b border-app-border bg-app-surface/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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
              {tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <SaveStatusBanner />
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href={`/cases/${caseId}/export`}>
              <FileDown className="h-4 w-4" />
              Export
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
