"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { SaveBar } from "@/components/shared/save-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProblemDraft } from "@/lib/types";

const statuses = ["active", "improving", "worsening", "resolved", "background"];

function blankProblem(priority: number): ProblemDraft {
  return {
    priority,
    title: "",
    status: "active",
    evidence: "",
    linkedImpressionRowId: "",
    notes: "",
  };
}

export function ProblemListEditor({
  rows: initialRows,
  finalImpressions,
  action,
}: {
  rows: ProblemDraft[];
  finalImpressions: Array<{ id: string; rank: number; title: string }>;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [rows, setRows] = useState(initialRows.length ? initialRows : [blankProblem(1)]);

  function update(index: number, patch: Partial<ProblemDraft>) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="rows" value={JSON.stringify(rows)} />
      {rows.map((row, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-[90px_1fr_160px]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Priority</span>
                <Input
                  type="number"
                  min={1}
                  value={row.priority}
                  onChange={(event) => update(index, { priority: Number(event.target.value) })}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Problem title</span>
                <Input value={row.title} onChange={(event) => update(index, { title: event.target.value })} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <Select
                  value={row.status}
                  onChange={(event) => update(index, { status: event.target.value as ProblemDraft["status"] })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove problem"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Evidence</span>
              <Textarea value={row.evidence} onChange={(event) => update(index, { evidence: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <Textarea value={row.notes} onChange={(event) => update(index, { notes: event.target.value })} />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Linked final impression</span>
              <Select
                value={row.linkedImpressionRowId ?? ""}
                onChange={(event) => update(index, { linkedImpressionRowId: event.target.value })}
              >
                <option value="">None</option>
                {finalImpressions.map((impression) => (
                  <option key={impression.id} value={impression.id}>
                    #{impression.rank} {impression.title || "Untitled impression"}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankProblem(current.length + 1)])}>
        <Plus className="h-4 w-4" />
        Add problem
      </Button>
      <SaveBar label="Save problem list" />
    </form>
  );
}
