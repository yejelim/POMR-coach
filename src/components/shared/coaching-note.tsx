import type { ReactNode } from "react";

export function CoachingNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 rounded-lg border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
      {children}
    </div>
  );
}
