"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ClinicalField, ClinicalSection } from "@/components/shared/clinical-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaveBar } from "@/components/shared/save-bar";
import type { ImpressionDraft, ImpressionStage } from "@/lib/types";

function blankRow(rank: number): ImpressionDraft {
  return {
    rank,
    title: "",
    evidence: "",
    evidenceAgainst: "",
    missingData: "",
    dxPlan: "",
    txPlan: "",
  };
}

export function ImpressionTable({
  rows: initialRows,
  stage,
  action,
  currentHref,
  previousHref,
  nextHref,
}: {
  rows: ImpressionDraft[];
  stage: ImpressionStage;
  action: (formData: FormData) => void | Promise<void>;
  currentHref?: string;
  previousHref?: string;
  nextHref?: string;
}) {
  const [rows, setRows] = useState(initialRows.length ? initialRows : [blankRow(1)]);
  const showMissingData = stage === "INITIAL";

  function update(index: number, patch: Partial<ImpressionDraft>) {
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
          title={row.title || `${stage === "INITIAL" ? "Initial" : "Final"} impression #${index + 1}`}
          eyebrow={`Ranked impression ${index + 1}`}
          actions={
            <Button
              type="button"
              variant="danger-ghost"
              size="icon"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove impression row"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="mb-4 grid gap-3 md:grid-cols-[110px_1fr]">
            <ClinicalField label="Rank">
              <Input
                type="number"
                min={1}
                value={row.rank}
                onChange={(event) => update(index, { rank: Number(event.target.value) })}
              />
            </ClinicalField>
            <ClinicalField
              label={stage === "INITIAL" ? "Initial Impression / DDx" : "Final Impression"}
            >
              <Input value={row.title} onChange={(event) => update(index, { title: event.target.value })} />
            </ClinicalField>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ClinicalField label={stage === "INITIAL" ? "Evidence from Hx/ROS/PE" : "Supporting Data"}>
              <Textarea value={row.evidence} onChange={(event) => update(index, { evidence: event.target.value })} />
            </ClinicalField>
            <ClinicalField label="Evidence Against / Remaining Uncertainty">
              <Textarea
                value={row.evidenceAgainst}
                onChange={(event) => update(index, { evidenceAgainst: event.target.value })}
              />
            </ClinicalField>
            {showMissingData ? (
              <ClinicalField label="Missing Data">
                <Textarea
                  value={row.missingData ?? ""}
                  onChange={(event) => update(index, { missingData: event.target.value })}
                />
              </ClinicalField>
            ) : null}
            <ClinicalField label="Dx Plan">
              <Textarea value={row.dxPlan} onChange={(event) => update(index, { dxPlan: event.target.value })} />
            </ClinicalField>
            <ClinicalField label="Tx Plan">
              <Textarea value={row.txPlan} onChange={(event) => update(index, { txPlan: event.target.value })} />
            </ClinicalField>
          </div>
        </ClinicalSection>
      ))}
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankRow(current.length + 1)])}>
        <Plus className="h-4 w-4" />
        Add impression
      </Button>
      <SaveBar
        label="Save impressions"
        currentHref={currentHref}
        previousHref={previousHref}
        nextHref={nextHref}
      />
    </form>
  );
}
