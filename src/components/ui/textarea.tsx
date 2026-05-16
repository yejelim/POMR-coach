import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm leading-6 text-app-text outline-none transition placeholder:text-app-text-faint focus:border-app-primary focus:ring-2 focus:ring-app-primary/10",
        className,
      )}
      {...props}
    />
  );
}
