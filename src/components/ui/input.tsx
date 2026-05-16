import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm text-app-text outline-none transition placeholder:text-app-text-faint focus:border-app-primary focus:ring-2 focus:ring-app-primary/10",
        className,
      )}
      {...props}
    />
  );
}
