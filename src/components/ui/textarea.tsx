import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-lg border border-app-border bg-app-surface px-3 py-2.5 text-[15px] leading-7 text-app-text shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] outline-none transition placeholder:text-app-text-faint hover:border-app-border-strong focus:border-app-primary focus:ring-2 focus:ring-app-primary/10",
        className,
      )}
      {...props}
    />
  );
  },
);
