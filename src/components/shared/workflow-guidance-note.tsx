import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";

export function WorkflowGuidanceNote({
  title,
  children,
  points = [],
}: {
  title: string;
  children: ReactNode;
  points?: string[];
}) {
  return (
    <section className="mb-5 rounded-xl border border-app-border bg-app-surface-soft/70 p-4 text-sm shadow-sm shadow-slate-200/30">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-app-primary-muted text-app-primary">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-app-text">{title}</h3>
          <div className="mt-1 leading-6 text-app-text-secondary">{children}</div>
          {points.length ? (
            <ul className="mt-3 grid gap-1.5 text-xs leading-5 text-app-text-muted md:grid-cols-2">
              {points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-app-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
