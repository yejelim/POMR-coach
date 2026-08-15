"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ClinicalField,
  ClinicalFormRow,
  ClinicalFormTable,
  ClinicalSection,
} from "@/components/shared/clinical-form";
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
  const [rows, setRows] = useState(() => (initialRows.length ? initialRows : [blankRow(1)]));
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
          eyebrow={`Impression ${index + 1}`}
          className="overflow-hidden"
          contentClassName="p-0"
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
          <ClinicalFormTable className="rounded-none border-0">
            <ClinicalFormRow label="순위와 Impression" hint="Rank · Differential diagnosis">
              <div className="grid gap-3 md:grid-cols-[96px_minmax(0,1fr)]">
                <Input
                  type="number"
                  min={1}
                  value={row.rank}
                  aria-label="Rank"
                  onChange={(event) => update(index, { rank: Number(event.target.value) })}
                />
                <Input
                  value={row.title}
                  aria-label={stage === "INITIAL" ? "Initial impression / Differential diagnosis" : "Final Impression"}
                  placeholder={stage === "INITIAL" ? "Initial impression / Differential diagnosis" : "Final Impression"}
                  onChange={(event) => update(index, { title: event.target.value })}
                />
              </div>
            </ClinicalFormRow>
            <ClinicalFormRow
              label={stage === "INITIAL" ? "근거" : "지지하는 검사 결과"}
              hint={stage === "INITIAL" ? "History / Review of systems / Physical examination" : "Lab / Image / Procedure"}
            >
              <Textarea
                className="min-h-28"
                value={row.evidence}
                onChange={(event) => update(index, { evidence: event.target.value })}
              />
            </ClinicalFormRow>
            <ClinicalFormRow label="반대 근거 · 불확실성" hint="Against / uncertainty">
              <Textarea
                className="min-h-24"
                value={row.evidenceAgainst}
                onChange={(event) => update(index, { evidenceAgainst: event.target.value })}
              />
            </ClinicalFormRow>
            {showMissingData ? (
              <ClinicalFormRow label="추가로 필요한 정보" hint="Missing data">
                <Textarea
                  className="min-h-24"
                  value={row.missingData ?? ""}
                  onChange={(event) => update(index, { missingData: event.target.value })}
                />
              </ClinicalFormRow>
            ) : null}
            <ClinicalFormRow label="계획" hint="Diagnosis · Treatment">
              <div className="grid gap-3 md:grid-cols-2">
                <ClinicalField label="진단 계획" hint="Diagnosis plan">
                  <Textarea
                    className="min-h-24"
                    value={row.dxPlan}
                    onChange={(event) => update(index, { dxPlan: event.target.value })}
                  />
                </ClinicalField>
                <ClinicalField label="치료 계획" hint="Treatment plan">
                  <Textarea
                    className="min-h-24"
                    value={row.txPlan}
                    onChange={(event) => update(index, { txPlan: event.target.value })}
                  />
                </ClinicalField>
              </div>
            </ClinicalFormRow>
          </ClinicalFormTable>
        </ClinicalSection>
      ))}
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankRow(current.length + 1)])}>
        <Plus className="h-4 w-4" />
        Impression 추가
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
