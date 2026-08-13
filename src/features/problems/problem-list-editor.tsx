"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ClinicalField, ClinicalSection } from "@/components/shared/clinical-form";
import { SaveBar } from "@/components/shared/save-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProblemDraft } from "@/lib/types";

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
          <div className="mb-4 grid gap-3 sm:grid-cols-[110px_1fr]">
              <ClinicalField label="Priority">
                <Input
                  type="number"
                  min={1}
                  value={row.priority}
                  onChange={(event) => update(index, { priority: Number(event.target.value) })}
                />
              </ClinicalField>
              <ClinicalField label="Problem title">
                <Input value={row.title} onChange={(event) => update(index, { title: event.target.value })} />
              </ClinicalField>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ClinicalField label="Evidence">
              <Textarea value={row.evidence} onChange={(event) => update(index, { evidence: event.target.value })} />
            </ClinicalField>
            <ClinicalField label="Notes">
              <Textarea value={row.notes} onChange={(event) => update(index, { notes: event.target.value })} />
            </ClinicalField>
            <ClinicalField label="Linked final impression" className="md:col-span-2">
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
            </ClinicalField>
          </div>
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
