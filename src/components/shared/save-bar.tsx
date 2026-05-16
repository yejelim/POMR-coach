"use client";

import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
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
  const { pending } = useFormStatus();
  const barRef = useRef<HTMLDivElement | null>(null);
  const savedKey = searchParams.toString();
  const savedFromUrl = searchParams.get("saved") === "1";
  const [dirtyState, setDirtyState] = useState({ key: savedKey, dirty: false });
  const dirty = dirtyState.key === savedKey && dirtyState.dirty;
  const saved = savedFromUrl && !dirty && !pending;
  const currentTarget = withSaved(currentHref);

  useEffect(() => {
    const form = barRef.current?.closest("form");
    if (!form) return;

    const markDirty = () => setDirtyState({ key: savedKey, dirty: true });
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
    };
  }, [savedKey]);

  return (
    <div ref={barRef} className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-app-border bg-app-surface/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {previousHref ? (
          <Button type="submit" variant="outline" name="redirectTo" value={withSaved(previousHref)} disabled={pending}>
            <ArrowLeft className="h-4 w-4" />
            Save & 이전
          </Button>
        ) : null}
        <Button
          type="submit"
          name="redirectTo"
          value={currentTarget}
          disabled={pending}
          className={saved ? "bg-app-success hover:brightness-95" : undefined}
        >
          <Save className="h-4 w-4" />
          {pending ? "저장 중..." : saved ? "저장 완료" : label}
        </Button>
        {nextHref ? (
          <Button type="submit" variant="secondary" name="redirectTo" value={withSaved(nextHref)} disabled={pending}>
            Save & 다음
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
        <span className={saved ? "text-sm font-medium text-app-success" : dirty ? "text-sm font-medium text-app-warning" : "text-sm text-app-text-muted"}>
          {pending ? "저장하는 중입니다." : saved ? "최근 변경사항이 저장되었습니다." : dirty ? "수정됨 - 저장이 필요합니다." : ""}
        </span>
      </div>
    </div>
  );
}

function withSaved(href?: string) {
  if (!href) return "";
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}saved=1`;
}
