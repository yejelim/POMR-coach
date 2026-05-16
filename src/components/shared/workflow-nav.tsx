import Link from "next/link";
import {
  ClipboardList,
  FileDown,
  FlaskConical,
  Library,
  ListChecks,
  NotebookTabs,
  PencilLine,
  Rows3,
  Stethoscope,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { SafetyNote } from "@/components/shared/safety-note";
import { SidebarToggle } from "@/components/shared/sidebar-toggle";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { cn } from "@/lib/utils";

const steps = [
  ["overview", "Case Overview", Library, ""],
  ["timeline", "Timeline", Rows3, "timeline"],
  ["admission", "Admission", Stethoscope, "admission"],
  ["initial", "Pre-test Impression", PencilLine, "impression/initial"],
  ["data", "Lab / Image / Procedure", FlaskConical, "data"],
  ["final", "Final Impression", ClipboardList, "impression/final"],
  ["problems", "Problems", ListChecks, "problems"],
  ["progress", "Progress SOAP", NotebookTabs, "progress"],
  ["export", "Export", FileDown, "export"],
] as const;

export function WorkflowNav({
  caseId,
  active,
}: {
  caseId: string;
  active: (typeof steps)[number][0];
}) {
  return (
    <aside className="pomr-sidebar no-print sticky top-0 hidden h-screen w-72 shrink-0 border-r border-app-border bg-app-sidebar transition-[width] duration-200 lg:flex lg:flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-app-border p-5">
        <div className="sidebar-logo-wrap min-w-0">
          <AppLogo />
        </div>
        <SidebarToggle />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link
          href="/cases"
          className="sidebar-nav-link mb-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text"
          title="Case Library"
        >
          <Library className="h-4 w-4" />
          <span className="sidebar-label truncate">Case Library</span>
        </Link>
        <div className="sidebar-expanded-only px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-app-text-faint">
          Workflow
        </div>
        {steps.map(([key, label, Icon, path]) => {
          const isImpressionChild = key === "initial" || key === "data" || key === "final";
          return (
            <Link
              key={key}
              href={`/cases/${caseId}${path ? `/${path}` : ""}`}
              title={label}
              className={cn(
                "sidebar-nav-link flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition",
                isImpressionChild && "sidebar-impression-child ml-4",
                active === key
                  ? "border-app-primary bg-app-sidebar-active text-app-primary"
                  : "border-transparent text-app-text-secondary hover:bg-app-surface-soft hover:text-app-text",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="sidebar-label truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-expanded-only space-y-4 border-t border-app-border p-4 text-xs leading-5 text-app-text-muted">
        <ThemeSwitcher />
        <div className="rounded-lg border border-app-border bg-app-surface-muted p-3">
          <div className="font-medium text-app-text-secondary">Local-first workspace</div>
          <SafetyNote />
        </div>
      </div>
    </aside>
  );
}

export function MobileWorkflowNav({
  caseId,
  active,
}: {
  caseId: string;
  active: (typeof steps)[number][0];
}) {
  return (
    <nav className="no-print flex gap-1 overflow-x-auto border-b border-app-border bg-app-surface px-4 lg:hidden">
      {steps.map(([key, label, Icon, path]) => (
        <Link
          key={key}
          href={`/cases/${caseId}${path ? `/${path}` : ""}`}
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition",
            active === key
              ? "border-app-primary text-app-primary"
              : "border-transparent text-app-text-secondary hover:text-app-text",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
