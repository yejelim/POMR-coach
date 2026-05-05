"use client";

import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultLabTable, type LabTable } from "@/lib/types";

export function LabTableEditor({ table }: { table?: LabTable | null }) {
  const initial = useMemo(() => table ?? defaultLabTable, [table]);
  const [columns, setColumns] = useState(initial.columns);
  const [rows, setRows] = useState(initial.rows);
  const labTable: LabTable = { schemaVersion: 1, columns, rows };

  function updateCell(rowIndex: number, column: string, value: string) {
    setRows((current) =>
      current.map((row, index) => (index === rowIndex ? { ...row, [column]: value } : row)),
    );
  }

  function addColumn() {
    const name = window.prompt("Column name");
    if (!name?.trim()) return;
    const cleanName = name.trim();
    setColumns((current) => [...current, cleanName]);
    setRows((current) => current.map((row) => ({ ...row, [cleanName]: "" })));
  }

  function removeColumn(column: string) {
    setColumns((current) => current.filter((item) => item !== column));
    setRows((current) =>
      current.map((row) => {
        const next = { ...row };
        delete next[column];
        return next;
      }),
    );
  }

  function moveColumn(index: number, direction: -1 | 1) {
    setColumns((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="labTable" value={JSON.stringify(labTable)} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setRows((current) => [...current, {}])}>
          <Plus className="h-4 w-4" />
          Row
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-4 w-4" />
          Column
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-teal-50">
            <tr>
              {columns.map((column, columnIndex) => (
                <th key={column} className="min-w-36 border-b border-r border-teal-100 p-2 text-left font-semibold text-teal-950">
                  <div className="flex items-center justify-between gap-2">
                    <span>{column}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded p-1 text-slate-400 hover:bg-white hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-30"
                        onClick={() => moveColumn(columnIndex, -1)}
                        disabled={columnIndex === 0}
                        aria-label={`Move ${column} left`}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-slate-400 hover:bg-white hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-30"
                        onClick={() => moveColumn(columnIndex, 1)}
                        disabled={columnIndex === columns.length - 1}
                        aria-label={`Move ${column} right`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {columns.length > 1 ? (
                        <button
                          type="button"
                          className="rounded p-1 text-slate-400 hover:bg-white hover:text-rose-600"
                          onClick={() => removeColumn(column)}
                          aria-label={`Remove ${column}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </th>
              ))}
              <th className="w-10 border-b border-slate-200 p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column} className="border-r border-t border-slate-200 p-1 align-top">
                    <Input
                      className="min-w-32 border-0 shadow-none focus:ring-0"
                      value={row[column] ?? ""}
                      onChange={(event) => updateCell(rowIndex, column, event.target.value)}
                    />
                  </td>
                ))}
                <td className="border-t border-slate-200 p-1 align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setRows((current) => current.filter((_, index) => index !== rowIndex))}
                    aria-label="Remove lab row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-slate-500">
                  Add rows for lab trends. Interpretation remains user-written.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
