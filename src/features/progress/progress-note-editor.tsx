"use client";

import { ArrowLeft, ArrowRight, History, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ClinicalFormRow,
  ClinicalFormTable,
  ClinicalSection,
} from "@/components/shared/clinical-form";
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
  previousNoteHref,
  previousNoteLabel,
  nextNoteHref,
  nextNoteLabel,
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
  previousNoteHref?: string;
  previousNoteLabel?: string;
  nextNoteHref?: string;
  nextNoteLabel?: string;
}) {
  const [rows, setRows] = useState(() =>
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
      <ProgressDateNavigator
        previousNoteHref={previousNoteHref}
        previousNoteLabel={previousNoteLabel}
        nextNoteHref={nextNoteHref}
        nextNoteLabel={nextNoteLabel}
      />
      <ClinicalSection
        title="Daily progress"
        eyebrow="Progress note"
        className="overflow-hidden"
        contentClassName="p-0"
      >
        <ClinicalFormTable className="rounded-none border-0">
          <ClinicalFormRow label="날짜 · 입원 경과일" hint="Date · Hospital Day">
            <div className="grid gap-3 md:grid-cols-2">
              <CompactField label="Date">
                <Input name="date" type="date" defaultValue={note.date} />
              </CompactField>
              <CompactField label="Hospital Day">
                <Input name="hospitalDay" defaultValue={note.hospitalDay} placeholder="예: 3" />
              </CompactField>
            </div>
          </ClinicalFormRow>
          <ClinicalFormRow label="식이 · 입출량" hint="Diet · Intake / Output">
            <div className="grid gap-3 md:grid-cols-2">
              <CompactField label="Diet">
                <Input name="diet" defaultValue={note.diet} />
              </CompactField>
              <CompactField label="Intake / Output">
                <Input name="io" defaultValue={note.io} />
              </CompactField>
            </div>
          </ClinicalFormRow>
          <ClinicalFormRow label="활력징후" hint="Vital signs">
            <VitalsEditor values={note.vitals} />
          </ClinicalFormRow>
          <ClinicalFormRow label="주요 경과 · 처치" hint="Overnight event · Drain / tube">
            <div className="grid gap-3 md:grid-cols-2">
              <CompactField label="Overnight event">
                <Textarea
                  name="overnightEvent"
                  defaultValue={note.overnightEvent}
                  rows={3}
                  className="min-h-20"
                />
              </CompactField>
              <CompactField label="Drain / tube">
                <Textarea
                  name="drainTube"
                  defaultValue={note.drainTube}
                  rows={3}
                  className="min-h-20"
                />
              </CompactField>
            </div>
          </ClinicalFormRow>
        </ClinicalFormTable>
      </ClinicalSection>

      {rows.map((row, index) => (
        <ClinicalSection
          key={index}
          title={problemTitle(row) || `Problem #${index + 1}`}
          eyebrow={`SOAP problem ${index + 1}`}
          className="overflow-hidden"
          contentClassName="p-0"
          actions={
            <Button
              type="button"
              variant="danger-ghost"
              size="icon"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove SOAP problem"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="flex items-center justify-between border-b border-app-border bg-app-surface-soft/65 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="h-8 w-52 bg-app-surface"
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
                className="h-8 w-36 bg-app-surface"
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
          </div>
          <div className="overflow-x-auto">
            <table className="clinical-table min-w-full border-collapse text-sm">
              <tbody>
                <SoapRow label="Problem name">
                  <div className="rounded-lg border border-app-border bg-app-surface-muted px-3 py-2 text-sm font-medium text-app-text-secondary">
                    {problemTitle(row) || "Problems 탭에서 등록한 problem을 선택하세요."}
                  </div>
                </SoapRow>
                <SoapRow label="Subjective (S)">
                  <ClinicalMarkupTextarea
                    value={row.subjective}
                    onChange={(value) => update(index, { subjective: value })}
                    rows={3}
                  />
                </SoapRow>
                <SoapRow label="Objective (O)">
                  <DynamicSoapItems
                    items={row.objectiveItems ?? objectiveItemsFromProblem(row)}
                    addLabel="Objective 항목 추가"
                    helperText="Lab · Image/Procedure · 신체진찰 등"
                    onChange={(items) => updateItems(index, "objectiveItems", items)}
                  />
                  <div className="mt-4 border-t border-app-border pt-4">
                    <ImageAttachmentEditor
                      images={row.objectiveImages ?? []}
                      onChange={(images) => update(index, { objectiveImages: images })}
                      label="Upload O image"
                    />
                  </div>
                </SoapRow>
                <SoapRow label="Assessment (A)">
                  <ClinicalMarkupTextarea
                    value={row.assessment}
                    onChange={(value) => update(index, { assessment: value })}
                    rows={4}
                  />
                </SoapRow>
                <SoapRow label="Plan (P)">
                  <DynamicSoapItems
                    items={row.planItems ?? planItemsFromProblem(row)}
                    addLabel="Plan 항목 추가"
                    helperText="기본: Diagnosis · Treatment · Education"
                    onChange={(items) => updateItems(index, "planItems", items)}
                  />
                </SoapRow>
              </tbody>
            </table>
          </div>
        </ClinicalSection>
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

function ProgressDateNavigator({
  previousNoteHref,
  previousNoteLabel,
  nextNoteHref,
  nextNoteLabel,
}: {
  previousNoteHref?: string;
  previousNoteLabel?: string;
  nextNoteHref?: string;
  nextNoteLabel?: string;
}) {
  if (!previousNoteHref && !nextNoteHref) return null;

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-app-primary/20 bg-app-primary-muted/45 px-3 py-2.5 md:flex-row md:items-center md:justify-between">
      <p className="text-xs font-semibold text-app-text-secondary">
        날짜별 노트 <span className="font-normal text-app-text-muted">· 저장 후 이동</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {previousNoteHref ? (
          <Button
            type="submit"
            variant="outline"
            size="sm"
            name="redirectTo"
            value={withSaved(previousNoteHref)}
            title={previousNoteLabel ? `저장 후 ${previousNoteLabel}로 이동` : "저장 후 이전 노트로 이동"}
          >
            <ArrowLeft className="h-4 w-4" />
            이전 날짜
          </Button>
        ) : null}
        {nextNoteHref ? (
          <Button
            type="submit"
            variant="default"
            size="sm"
            name="redirectTo"
            value={withSaved(nextNoteHref)}
            title={nextNoteLabel ? `저장 후 ${nextNoteLabel}로 이동` : "저장 후 다음 노트로 이동"}
          >
            다음 날짜
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function CompactField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:items-center">
      <span className="text-xs font-medium text-app-text-muted">{label}</span>
      {children}
    </label>
  );
}

function withSaved(href: string) {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}saved=1`;
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
      className="h-8 bg-app-surface"
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
    <tr className="border-b border-app-border last:border-b-0">
      <th className="w-36 bg-app-surface-muted p-4 text-left align-top text-sm font-semibold text-app-text-secondary">
        {label}
      </th>
      <td className="p-4 align-top">{children}</td>
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
  helperText,
  onChange,
}: {
  items: SoapSubfield[];
  addLabel: string;
  helperText?: string;
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
      {helperText ? <span className="ml-2 align-middle text-xs leading-5 text-app-text-muted">{helperText}</span> : null}
    </div>
  );
}
