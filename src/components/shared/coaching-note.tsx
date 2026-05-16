import type { ReactNode } from "react";

export function CoachingNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 rounded-xl border border-app-primary-soft bg-app-primary-muted p-4 text-sm leading-6 text-app-primary">
      {children}
    </div>
  );
}
