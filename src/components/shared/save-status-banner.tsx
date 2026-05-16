"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function SaveStatusBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("saved") !== "1") return null;

  return (
    <div className="mt-3 flex w-fit items-center gap-2 rounded-md border border-app-primary-soft bg-app-primary-muted px-3 py-2 text-sm font-medium text-app-primary">
      <CheckCircle2 className="h-4 w-4" />
      저장이 완료되었습니다.
    </div>
  );
}
