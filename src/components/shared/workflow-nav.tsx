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
import { cn } from "@/lib/utils";

const steps = [
  ["overview", "Overview", Library, ""],
  ["timeline", "Timeline", Rows3, "timeline"],
  ["admission", "Admission", Stethoscope, "admission"],
  ["initial", "Pre-test", PencilLine, "impression/initial"],
  ["data", "Data", FlaskConical, "data"],
  ["final", "Post-test", ClipboardList, "impression/final"],
  ["problems", "Problems", ListChecks, "problems"],
  ["progress", "SOAP", NotebookTabs, "progress"],
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
    <nav className="no-print flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4">
      {steps.map(([key, label, Icon, path]) => (
        <Link
          key={key}
          href={`/cases/${caseId}${path ? `/${path}` : ""}`}
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium text-slate-600 transition hover:text-slate-950",
            active === key
              ? "border-slate-950 text-slate-950"
              : "border-transparent",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
