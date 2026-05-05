"use client";

import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SaveBar({
  label = "Save",
  currentHref,
  previousHref,
  nextHref,
}: {
  label?: string;
  currentHref?: string;
  previousHref?: string;
  nextHref?: string;
}) {
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const currentTarget = withSaved(currentHref);

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {previousHref ? (
          <Button type="submit" variant="outline" name="redirectTo" value={withSaved(previousHref)}>
            <ArrowLeft className="h-4 w-4" />
            Save & 이전
          </Button>
        ) : null}
        <Button
          type="submit"
          name="redirectTo"
          value={currentTarget}
          className={saved ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
        >
          <Save className="h-4 w-4" />
          {saved ? "저장 완료" : label}
        </Button>
        {nextHref ? (
          <Button type="submit" variant="secondary" name="redirectTo" value={withSaved(nextHref)}>
            Save & 다음
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function withSaved(href?: string) {
  if (!href) return "";
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}saved=1`;
}
