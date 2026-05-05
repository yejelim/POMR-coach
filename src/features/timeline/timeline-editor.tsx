"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaveBar } from "@/components/shared/save-bar";
import type { TimelineDraft } from "@/lib/types";

const blankEntry: TimelineDraft = {
  timepoint: "",
  event: "",
  interpretation: "",
  question: "",
};

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
  const [rows, setRows] = useState(entries.length ? entries : [blankEntry]);

  function update(index: number, patch: Partial<TimelineDraft>) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="entries" value={JSON.stringify(rows)} />
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">Entry {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                aria-label="Remove timeline entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Relative date/timepoint</span>
                <Input
                  value={row.timepoint}
                  onChange={(event) => update(index, { timepoint: event.target.value })}
                  placeholder="3 weeks before admission"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Event</span>
                <Textarea
                  value={row.event}
                  onChange={(event) => update(index, { event: event.target.value })}
                  rows={3}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Interpretation</span>
                <Textarea
                  value={row.interpretation}
                  onChange={(event) => update(index, { interpretation: event.target.value })}
                  rows={3}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Question / uncertainty</span>
                <Textarea
                  value={row.question}
                  onChange={(event) => update(index, { question: event.target.value })}
                  rows={3}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankEntry])}>
        <Plus className="h-4 w-4" />
        Add entry
      </Button>
      <SaveBar
        label="Save timeline"
        currentHref={currentHref}
        previousHref={previousHref}
        nextHref={nextHref}
      />
    </form>
  );
}
