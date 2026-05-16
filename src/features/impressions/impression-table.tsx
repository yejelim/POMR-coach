"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
        <div key={index} className="rounded-xl border border-app-border bg-app-surface p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-app-text-secondary">Rank</span>
              <Input
                className="w-20"
                type="number"
                min={1}
                value={row.rank}
                onChange={(event) => update(index, { rank: Number(event.target.value) })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove impression row"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-app-text-secondary">
                {stage === "INITIAL" ? "Initial Impression / DDx" : "Final Impression"}
              </span>
              <Input value={row.title} onChange={(event) => update(index, { title: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">
                {stage === "INITIAL" ? "Evidence from Hx/ROS/PE" : "Supporting Data"}
              </span>
              <Textarea value={row.evidence} onChange={(event) => update(index, { evidence: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">
                Evidence Against / Remaining Uncertainty
              </span>
              <Textarea
                value={row.evidenceAgainst}
                onChange={(event) => update(index, { evidenceAgainst: event.target.value })}
              />
            </label>
            {showMissingData ? (
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-app-text-secondary">Missing Data</span>
                <Textarea
                  value={row.missingData ?? ""}
                  onChange={(event) => update(index, { missingData: event.target.value })}
                />
              </label>
            ) : null}
            <label className="space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">Dx Plan</span>
              <Textarea value={row.dxPlan} onChange={(event) => update(index, { dxPlan: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">Tx Plan</span>
              <Textarea value={row.txPlan} onChange={(event) => update(index, { txPlan: event.target.value })} />
            </label>
          </div>
        </div>
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
