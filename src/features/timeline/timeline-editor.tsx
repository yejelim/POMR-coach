"use client";

import { useMemo, useState } from "react";
import { SaveBar } from "@/components/shared/save-bar";
import { Textarea } from "@/components/ui/textarea";
import type { TimelineDraft } from "@/lib/types";

export function TimelineEditor({
  entries,
  action,
  currentHref,
  previousHref,
  nextHref,
}: {
  entries: TimelineDraft[];
  action: (formData: FormData) => void | Promise<void>;
  currentHref?: string;
  previousHref?: string;
  nextHref?: string;
}) {
  const initialMemo = useMemo(() => timelineEntriesToMemo(entries), [entries]);
  const [memo, setMemo] = useState(initialMemo);
  const rows: TimelineDraft[] = memo.trim()
    ? [
        {
          timepoint: "",
          event: memo,
          interpretation: "",
          question: "",
        },
      ]
    : [];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="entries" value={JSON.stringify(rows)} />
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">EHR review memo</span>
          <Textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            rows={18}
            placeholder="EHR 보면서 환자에게 있었던 주요 이벤트, 약물복용력, 수술력, 검사/시술 흐름 등을 자유롭게 메모하세요."
            className="font-mono text-sm leading-6"
          />
        </label>
      </section>
      <SaveBar
        label="Save timeline memo"
        currentHref={currentHref}
        previousHref={previousHref}
        nextHref={nextHref}
      />
    </form>
  );
}

function timelineEntriesToMemo(entries: TimelineDraft[]) {
  if (!entries.length) return "";
  return entries
    .map((entry) => {
      const structuredParts = [
        entry.timepoint ? `[${entry.timepoint}]` : "",
        entry.event,
        entry.interpretation ? `Interpretation: ${entry.interpretation}` : "",
        entry.question ? `Question: ${entry.question}` : "",
      ].filter(Boolean);
      return structuredParts.join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}
