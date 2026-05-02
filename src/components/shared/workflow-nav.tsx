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
    <aside className="no-print sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-slate-200 p-5">
        <AppLogo />
        <p className="mt-4 text-xs leading-5 text-slate-500">
          먼저 직접 쓰고, AI feedback으로 reasoning을 되돌아봅니다.
        </p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link
          href="/cases"
          className="mb-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <Library className="h-4 w-4" />
          Case Library
        </Link>
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Workflow
        </div>
        {steps.map(([key, label, Icon, path]) => {
          const isImpressionChild = key === "initial" || key === "data" || key === "final";
          return (
            <Link
              key={key}
              href={`/cases/${caseId}${path ? `/${path}` : ""}`}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                isImpressionChild && "ml-4",
                active === key
                  ? "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500">
        HealCode: We Heal Patient, with Code and Love.
        <br />
        Educational use only.
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
    <nav className="no-print flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 lg:hidden">
      {steps.map(([key, label, Icon, path]) => (
        <Link
          key={key}
          href={`/cases/${caseId}${path ? `/${path}` : ""}`}
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition",
            active === key
              ? "border-teal-700 text-teal-800"
              : "border-transparent text-slate-600 hover:text-slate-950",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
