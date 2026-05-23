"use client";

import { History, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { SaveBar } from "@/components/shared/save-bar";
import { ImageAttachmentEditor } from "@/components/shared/image-attachment-editor";
import { VitalsEditor } from "@/components/shared/vitals-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  makeSoapField,
  mergeLegacySoapFields,
  objectiveItemsFromProblem,
  planItemsFromProblem,
} from "@/lib/soap-fields";
import type { ProgressProblemDraft, SoapSubfield, Vitals } from "@/lib/types";

function blankProblem(): ProgressProblemDraft {
  return {
    problemId: "",
    titleSnapshot: "",
    subjective: "",
    objectiveItems: objectiveItemsFromProblem({}),
    objectiveImages: [],
    objectivePe: "",
    objectiveLab: "",
    objectiveImageProcedure: "",
    objectiveDrain: "",
    assessment: "",
    planItems: planItemsFromProblem({}),
    planDx: "",
    planTx: "",
    planMonitoring: "",
    planEducation: "",
  };
}

type LatestProblemNote = ProgressProblemDraft & {
  sourceLabel: string;
};

export function ProgressNoteEditor({
  note,
  problems: selectableProblems,
  latestProblemNotes = [],
  action,
  currentHref,
  previousHref,
  nextHref,
}: {
  note: {
    date: string;
    hospitalDay: string;
    vitals?: Vitals | null;
    diet: string;
    io: string;
    overnightEvent: string;
    drainTube: string;
    problems: ProgressProblemDraft[];
  };
  problems: Array<{ id: string; priority: number; title: string }>;
  latestProblemNotes?: LatestProblemNote[];
  action: (formData: FormData) => void | Promise<void>;
  currentHref?: string;
  previousHref?: string;
  nextHref?: string;
}) {
  const [rows, setRows] = useState(
    note.problems.length ? note.problems.map(mergeLegacySoapFields) : [blankProblem()],
  );
  const rowsForSave = rows.map(mergeLegacySoapFields);
  const latestByProblemId = useMemo(
    () =>
      new Map(
        latestProblemNotes.map((problem): [string, LatestProblemNote] => [
          problem.problemId ?? "",
          { ...mergeLegacySoapFields(problem), sourceLabel: problem.sourceLabel },
        ]),
      ),
    [latestProblemNotes],
  );

  function update(index: number, patch: Partial<ProgressProblemDraft>) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  function updateItems(
    rowIndex: number,
    key: "objectiveItems" | "planItems",
    items: SoapSubfield[],
  ) {
    update(rowIndex, { [key]: items });
  }

  function loadLatestSoap(index: number) {
    const current = rows[index];
    const latest = current.problemId ? latestByProblemId.get(current.problemId) : undefined;
    if (!latest) return;
    if (hasSoapDraftContent(current)) {
      const confirmed = window.confirm("현재 작성 중인 SOAP 내용을 최신 기록으로 덮어쓸까요?");
      if (!confirmed) return;
    }

    update(index, {
      titleSnapshot: current.titleSnapshot || latest.titleSnapshot,
      subjective: latest.subjective,
      objectiveItems: latest.objectiveItems,
      objectiveImages: latest.objectiveImages ?? [],
      objectivePe: latest.objectivePe,
      objectiveLab: latest.objectiveLab,
      objectiveImageProcedure: latest.objectiveImageProcedure,
      objectiveDrain: latest.objectiveDrain,
      assessment: latest.assessment,
      planItems: latest.planItems,
      planDx: latest.planDx,
      planTx: latest.planTx,
      planMonitoring: latest.planMonitoring,
      planEducation: latest.planEducation,
    });
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="problems" value={JSON.stringify(rowsForSave)} />
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Date</span>
            <Input name="date" type="date" defaultValue={note.date} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">HD</span>
            <Input name="hospitalDay" defaultValue={note.hospitalDay} placeholder="HD#3" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Diet</span>
            <Input name="diet" defaultValue={note.diet} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">I/O</span>
            <Input name="io" defaultValue={note.io} />
          </label>
        </div>
        <div className="mt-4">
          <VitalsEditor values={note.vitals} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Overnight event</span>
            <Textarea name="overnightEvent" defaultValue={note.overnightEvent} rows={3} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Drain / tube</span>
            <Textarea name="drainTube" defaultValue={note.drainTube} rows={3} />
          </label>
        </div>
      </section>

      {rows.map((row, index) => (
        <section key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between border-b border-slate-200 bg-teal-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-teal-950">Problem #{index + 1}</span>
              <Select
                className="h-8 w-52 bg-white"
                value={row.problemId ?? ""}
                onChange={(event) => {
                  const selected = selectableProblems.find((problem) => problem.id === event.target.value);
                  update(index, {
                    problemId: event.target.value,
                    titleSnapshot: selected?.title ?? row.titleSnapshot,
                  });
                }}
              >
                <option value="">Unlinked</option>
                {selectableProblems.map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    #{problem.priority} {problem.title}
                  </option>
                ))}
              </Select>
              <LoadLatestSoapButton
                latest={row.problemId ? latestByProblemId.get(row.problemId) : undefined}
                onClick={() => loadLatestSoap(index)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove SOAP problem"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                <SoapRow label="Problem name">
                  <Input
                    value={row.titleSnapshot}
                    onChange={(event) => update(index, { titleSnapshot: event.target.value })}
                  />
                </SoapRow>
                <SoapRow label="S">
                  <Textarea
                    value={row.subjective}
                    onChange={(event) => update(index, { subjective: event.target.value })}
                    rows={3}
                  />
                </SoapRow>
                <SoapRow label="O">
                  <DynamicSoapItems
                    items={row.objectiveItems ?? objectiveItemsFromProblem(row)}
                    addLabel="Add O item"
                    onChange={(items) => updateItems(index, "objectiveItems", items)}
                  />
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <ImageAttachmentEditor
                      images={row.objectiveImages ?? []}
                      onChange={(images) => update(index, { objectiveImages: images })}
                      label="Upload O image"
                    />
                  </div>
                </SoapRow>
                <SoapRow label="A">
                  <Textarea
                    value={row.assessment}
                    onChange={(event) => update(index, { assessment: event.target.value })}
                    rows={4}
                  />
                </SoapRow>
                <SoapRow label="P">
                  <DynamicSoapItems
                    items={row.planItems ?? planItemsFromProblem(row)}
                    addLabel="Add P item"
                    onChange={(items) => updateItems(index, "planItems", items)}
                  />
                </SoapRow>
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankProblem()])}>
        <Plus className="h-4 w-4" />
        Add SOAP problem
      </Button>
      <SaveBar
        label="Save progress note"
        currentHref={currentHref}
        previousHref={previousHref}
        nextHref={nextHref}
      />
    </form>
  );
}

function LoadLatestSoapButton({
  latest,
  onClick,
}: {
  latest?: LatestProblemNote;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 bg-white"
      onClick={onClick}
      disabled={!latest}
      title={latest ? `${latest.sourceLabel || "이전 노트"}에서 불러오기` : "같은 problem의 이전 SOAP note가 없습니다."}
    >
      <History className="h-4 w-4" />
      최신 SOAP note 불러오기
    </Button>
  );
}

function SoapRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <th className="w-36 bg-slate-50 p-3 text-left align-top text-sm font-semibold text-slate-700">
        {label}
      </th>
      <td className="p-3 align-top">{children}</td>
    </tr>
  );
}

function hasSoapDraftContent(row: ProgressProblemDraft) {
  return Boolean(
    row.subjective.trim() ||
      row.assessment.trim() ||
      row.objectiveItems?.some((item) => item.label.trim() || item.value.trim()) ||
      row.objectiveImages?.some((image) => image.dataUrl || image.caption?.trim() || image.note?.trim()) ||
      row.planItems?.some((item) => item.label.trim() || item.value.trim()) ||
      row.objectivePe.trim() ||
      row.objectiveLab.trim() ||
      row.objectiveImageProcedure.trim() ||
      row.objectiveDrain.trim() ||
      row.planDx.trim() ||
      row.planTx.trim() ||
      row.planMonitoring.trim() ||
      row.planEducation.trim(),
  );
}

function DynamicSoapItems({
  items,
  addLabel,
  onChange,
}: {
  items: SoapSubfield[];
  addLabel: string;
  onChange: (items: SoapSubfield[]) => void;
}) {
  function updateItem(index: number, patch: Partial<SoapSubfield>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="grid gap-2 md:grid-cols-[180px_1fr_40px]">
          <Input
            value={item.label}
            onChange={(event) => updateItem(index, { label: event.target.value })}
            aria-label="SOAP subfield label"
          />
          <Textarea
            value={item.value}
            rows={3}
            onChange={(event) => updateItem(index, { value: event.target.value })}
            aria-label={`${item.label} note`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            aria-label="Remove SOAP subfield"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, makeSoapField("New item")])}
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
