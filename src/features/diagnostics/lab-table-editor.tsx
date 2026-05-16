"use client";

import { ArrowLeft, ArrowRight, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultLabTable, type LabTable } from "@/lib/types";

export function LabTableEditor({ table }: { table?: LabTable | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initial = useMemo(() => table ?? defaultLabTable, [table]);
  const [columns, setColumns] = useState(initial.columns);
  const [rows, setRows] = useState(initial.rows);
  const [importMessage, setImportMessage] = useState<string | null>(null);
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

  async function importWorkbook(file: File | undefined) {
    if (!file) return;
    setImportMessage(null);
    try {
      const { readSheet } = await import("read-excel-file/browser");
      const rawRows = await readSheet(file);
      const nonEmptyRows = rawRows
        .map((row) => row.map((cell) => formatImportedCell(cell)))
        .filter((row) => row.some(Boolean));

      if (!nonEmptyRows.length) {
        setImportMessage("엑셀 파일에서 읽을 수 있는 lab data가 없습니다.");
        return;
      }

      const importedColumns = normalizeImportedColumns(nonEmptyRows[0]);
      const importedRows = nonEmptyRows.slice(1).map((row) => {
        const next: Record<string, string> = {};
        importedColumns.forEach((column, index) => {
          next[column] = row[index] ?? "";
        });
        return next;
      });

      setColumns(importedColumns);
      setRows(importedRows);
      setImportMessage(`${file.name}에서 ${importedRows.length}개 row를 불러왔습니다. 저장 버튼을 눌러 반영하세요.`);
    } catch (error) {
      console.error(error);
      setImportMessage("엑셀 파일을 읽지 못했습니다. .xlsx 형식인지 확인해주세요.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="labTable" value={JSON.stringify(labTable)} />
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(event) => void importWorkbook(event.target.files?.[0])}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FileSpreadsheet className="h-4 w-4" />
          Import xlsx
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setRows((current) => [...current, {}])}>
          <Plus className="h-4 w-4" />
          Row
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-4 w-4" />
          Column
        </Button>
      </div>
      {importMessage ? (
        <div className="rounded-md border border-app-accent/20 bg-app-accent-soft px-3 py-2 text-sm text-app-text">
          {importMessage}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-app-border bg-app-surface shadow-none">
        <table className="clinical-table min-w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column, columnIndex) => (
                <th key={column} className="sticky top-0 min-w-36 border-b border-r p-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span>{column}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded p-1 text-app-text-faint hover:bg-app-surface hover:text-app-primary disabled:cursor-not-allowed disabled:opacity-30"
                        onClick={() => moveColumn(columnIndex, -1)}
                        disabled={columnIndex === 0}
                        aria-label={`Move ${column} left`}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-app-text-faint hover:bg-app-surface hover:text-app-primary disabled:cursor-not-allowed disabled:opacity-30"
                        onClick={() => moveColumn(columnIndex, 1)}
                        disabled={columnIndex === columns.length - 1}
                        aria-label={`Move ${column} right`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {columns.length > 1 ? (
                        <button
                          type="button"
                          className="rounded p-1 text-app-text-faint hover:bg-app-surface hover:text-app-danger"
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
              <th className="w-10 border-b p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column} className="border-r border-t p-1 align-top">
                    <Input
                      className="min-w-32 border-0 shadow-none focus:ring-0"
                      value={row[column] ?? ""}
                      onChange={(event) => updateCell(rowIndex, column, event.target.value)}
                    />
                  </td>
                ))}
                <td className="border-t p-1 align-middle">
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
                <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-app-text-muted">
                  검사 항목과 결과를 표로 정리하세요. 필요한 시점은 열로 추가할 수 있습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function normalizeImportedColumns(headerRow: string[]) {
  const seen = new Map<string, number>();
  return headerRow.map((column, index) => {
    const base = column || `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base} ${count + 1}` : base;
  });
}

function formatImportedCell(cell: unknown) {
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  return String(cell ?? "").trim();
}
