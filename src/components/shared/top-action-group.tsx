import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopActionGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-full shrink-0 flex-wrap items-center gap-1 rounded-xl bg-app-surface-soft/95 p-1 shadow-md shadow-black/5",
        className,
      )}
    >
      {children}
    </div>
  );
}
