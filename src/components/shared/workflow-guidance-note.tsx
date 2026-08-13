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
    <section className="mb-5 rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <details>
        <summary className="flex cursor-pointer list-none items-center gap-3 text-app-text marker:hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-app-primary-muted text-app-primary">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 font-semibold">{title}</span>
          <span className="text-xs font-medium text-app-text-muted">핵심 보기</span>
        </summary>
        <div className="mt-3 border-t border-app-border pt-3 leading-6 text-app-text-secondary">
          {children}
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
      </details>
    </section>
  );
}
