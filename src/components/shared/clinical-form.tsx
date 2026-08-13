import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ClinicalSection({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const hasHeader = title || description || eyebrow || actions;

  return (
    <section
      className={cn(
        "rounded-xl border border-app-border bg-app-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-3 border-b border-app-border px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-app-text-faint">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="text-base font-semibold leading-snug text-app-text">{title}</h3> : null}
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-app-text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function ClinicalField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <FieldLabel label={label} hint={hint} />
      {children}
    </label>
  );
}

export function ClinicalFieldGroup({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} hint={hint} />
      {children}
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="block">
      <span className="block text-[13px] font-semibold leading-5 text-app-text-secondary">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs leading-5 text-app-text-muted">{hint}</span> : null}
    </span>
  );
}
