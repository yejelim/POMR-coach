"use client";

import { History, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ClinicalMarkupTextarea } from "@/components/shared/clinical-markup-textarea";
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
import type { ProblemStatus, ProgressProblemDraft, SoapSubfield, Vitals } from "@/lib/types";

const problemStatuses: Array<{ value: ProblemStatus; label: string }> = [
  { value: "active", label: "active" },
  { value: "improving", label: "improving" },
  { value: "worsening", label: "worsening" },
  { value: "resolved", label: "resolved" },
  { value: "background", label: "background" },
];

function blankProblem(): ProgressProblemDraft {
  return {
    problemId: "",
    progressStatus: "active",
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
  problems: Array<{ id: string; priority: number; title: string; status: ProblemStatus }>;
  latestProblemNotes?: LatestProblemNote[];
  action: (formData: FormData) => void | Promise<void>;
  currentHref?: string;
  previousHref?: string;
  nextHref?: string;
}) {
  const [rows, setRows] = useState(
    note.problems.length ? note.problems.map(mergeLegacySoapFields) : [blankProblem()],
  );
  const problemById = useMemo(
    () => new Map(selectableProblems.map((problem): [string, (typeof selectableProblems)[number]] => [problem.id, problem])),
    [selectableProblems],
  );
  const rowsForSave = rows.map((row) => {
    const merged = mergeLegacySoapFields(row);
    const selectedProblem = merged.problemId ? problemById.get(merged.problemId) : undefined;
    return {
      ...merged,
      progressStatus: merged.progressStatus ?? selectedProblem?.status ?? "active",
      // titleSnapshot is an immutable record of the problem title at the time this
      // note was written. Only seed it when missing; do not overwrite it from the
      // (possibly renamed) live problem, which would rewrite history on re-save.
      titleSnapshot: merged.titleSnapshot || (selectedProblem?.title ?? ""),
    };
  });
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

  function problemTitle(row: ProgressProblemDraft) {
    return row.problemId ? problemById.get(row.problemId)?.title ?? row.titleSnapshot : row.titleSnapshot;
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
      titleSnapshot: problemTitle(current) || latest.titleSnapshot,
      progressStatus: latest.progressStatus ?? current.progressStatus ?? "active",
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
                  const selected = problemById.get(event.target.value);
                  update(index, {
                    problemId: event.target.value,
                    progressStatus: selected?.status ?? row.progressStatus ?? "active",
                    titleSnapshot: selected?.title ?? "",
                  });
                }}
              >
                <option value="">Problem 선택</option>
                {selectableProblems.map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    #{problem.priority} {problem.title}
                  </option>
                ))}
              </Select>
              <Select
                className="h-8 w-36 bg-white"
                value={row.progressStatus ?? "active"}
                onChange={(event) => update(index, { progressStatus: event.target.value as ProblemStatus })}
                aria-label="Progress problem status"
              >
                {problemStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
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
              variant="danger-ghost"
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
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    {problemTitle(row) || "Problems 탭에서 등록한 problem을 선택하세요."}
                  </div>
                </SoapRow>
                <SoapRow label="S">
                  <ClinicalMarkupTextarea
                    value={row.subjective}
                    onChange={(value) => update(index, { subjective: value })}
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
                  <ClinicalMarkupTextarea
                    value={row.assessment}
                    onChange={(value) => update(index, { assessment: value })}
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
          <ClinicalMarkupTextarea
            value={item.value}
            rows={3}
            onChange={(value) => updateItem(index, { value })}
            aria-label={`${item.label} note`}
          />
          <Button
            type="button"
            variant="danger-ghost"
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
