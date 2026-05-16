import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm text-app-text outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
  },
);
