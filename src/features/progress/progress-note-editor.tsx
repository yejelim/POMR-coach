"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { SaveBar } from "@/components/shared/save-bar";
import { VitalsEditor } from "@/components/shared/vitals-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProgressProblemDraft, Vitals } from "@/lib/types";

function blankProblem(): ProgressProblemDraft {
  return {
    problemId: "",
    titleSnapshot: "",
    subjective: "",
    objectivePe: "",
    objectiveLab: "",
    objectiveImageProcedure: "",
    objectiveDrain: "",
    assessment: "",
    planDx: "",
    planTx: "",
    planMonitoring: "",
    planEducation: "",
  };
}

export function ProgressNoteEditor({
  note,
  problems: selectableProblems,
  action,
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
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [rows, setRows] = useState(note.problems.length ? note.problems : [blankProblem()]);

  function update(index: number, patch: Partial<ProgressProblemDraft>) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="problems" value={JSON.stringify(rows)} />
      <section className="rounded-lg border border-slate-200 bg-white p-4">
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
        <section key={index} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="grid flex-1 gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Problem link</span>
                <Select
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
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Problem title</span>
                <Input
                  value={row.titleSnapshot}
                  onChange={(event) => update(index, { titleSnapshot: event.target.value })}
                />
              </label>
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
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">S</span>
              <Textarea value={row.subjective} onChange={(event) => update(index, { subjective: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">O: PE</span>
              <Textarea value={row.objectivePe} onChange={(event) => update(index, { objectivePe: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">O: Lab</span>
              <Textarea value={row.objectiveLab} onChange={(event) => update(index, { objectiveLab: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">O: Image / Procedure</span>
              <Textarea
                value={row.objectiveImageProcedure}
                onChange={(event) => update(index, { objectiveImageProcedure: event.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">O: Drain</span>
              <Textarea
                value={row.objectiveDrain}
                onChange={(event) => update(index, { objectiveDrain: event.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">A</span>
              <Textarea value={row.assessment} onChange={(event) => update(index, { assessment: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">P: Dx</span>
              <Textarea value={row.planDx} onChange={(event) => update(index, { planDx: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">P: Tx</span>
              <Textarea value={row.planTx} onChange={(event) => update(index, { planTx: event.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">P: Monitoring</span>
              <Textarea
                value={row.planMonitoring}
                onChange={(event) => update(index, { planMonitoring: event.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">P: Education</span>
              <Textarea
                value={row.planEducation}
                onChange={(event) => update(index, { planEducation: event.target.value })}
              />
            </label>
          </div>
        </section>
      ))}

      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, blankProblem()])}>
        <Plus className="h-4 w-4" />
        Add SOAP problem
      </Button>
      <SaveBar label="Save progress note" />
    </form>
  );
}
