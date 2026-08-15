"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ClinicalFormRow,
  ClinicalFormTable,
  ClinicalSection,
} from "@/components/shared/clinical-form";
import { SaveBar } from "@/components/shared/save-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProblemDraft, ProblemStatus } from "@/lib/types";

const problemStatuses: Array<{ value: ProblemStatus; label: string }> = [
  { value: "active", label: "active" },
  { value: "improving", label: "improving" },
  { value: "worsening", label: "worsening" },
  { value: "resolved", label: "resolved" },
  { value: "background", label: "background" },
];

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
  currentHref,
  previousHref,
  nextHref,
}: {
  rows: ProblemDraft[];
  finalImpressions: Array<{ id: string; rank: number; title: string }>;
  action: (formData: FormData) => void | Promise<void>;
  currentHref?: string;
  previousHref?: string;
  nextHref?: string;
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
        <ClinicalSection
          key={index}
          title={row.title || `Problem #${index + 1}`}
          eyebrow={`Problem list item ${index + 1}`}
          className="overflow-hidden"
          contentClassName="p-0"
          actions={
            <Button
              type="button"
              variant="danger-ghost"
              size="icon"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove problem"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <ClinicalFormTable className="rounded-none border-0">
            <ClinicalFormRow label="Priority / Problem">
              <div className="grid gap-3 md:grid-cols-[96px_minmax(0,1fr)]">
                <Input
                  type="number"
                  min={1}
                  value={row.priority}
                  aria-label="Priority"
                  onChange={(event) => update(index, { priority: Number(event.target.value) })}
                />
                <Input
                  value={row.title}
                  aria-label="Problem title"
                  placeholder="Problem title"
                  onChange={(event) => update(index, { title: event.target.value })}
                />
              </div>
            </ClinicalFormRow>
            <ClinicalFormRow label="Status / Link">
              <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <Select
                  value={row.status}
                  aria-label="Problem status"
                  onChange={(event) => update(index, { status: event.target.value as ProblemStatus })}
                >
                  {problemStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={row.linkedImpressionRowId ?? ""}
                  aria-label="Linked final impression"
                  onChange={(event) => update(index, { linkedImpressionRowId: event.target.value })}
                >
                  <option value="">Linked final impression 없음</option>
                  {finalImpressions.map((impression) => (
                    <option key={impression.id} value={impression.id}>
                      #{impression.rank} {impression.title || "Untitled impression"}
                    </option>
                  ))}
                </Select>
              </div>
            </ClinicalFormRow>
            <ClinicalFormRow label="Evidence">
              <Textarea
                className="min-h-28"
                value={row.evidence}
                onChange={(event) => update(index, { evidence: event.target.value })}
              />
            </ClinicalFormRow>
            <ClinicalFormRow label="Notes">
              <Textarea
                className="min-h-24"
                value={row.notes}
                onChange={(event) => update(index, { notes: event.target.value })}
              />
            </ClinicalFormRow>
          </ClinicalFormTable>
        </ClinicalSection>
      ))}
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankProblem(current.length + 1)])}>
        <Plus className="h-4 w-4" />
        Add problem
      </Button>
      <SaveBar
        label="Save problem list"
        currentHref={currentHref}
        previousHref={previousHref}
        nextHref={nextHref}
      />
    </form>
  );
}
