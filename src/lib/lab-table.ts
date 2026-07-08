import type { LabCellStyles, LabCellTone } from "@/lib/types";

export function labCellKey(rowIndex: number, column: string) {
  return `${rowIndex}:${encodeURIComponent(column)}`;
}

export function normalizeLabCellStyles(
  value: unknown,
  columns: string[],
  rowCount: number,
): LabCellStyles {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const allowedColumns = new Set(columns);
  const normalized: LabCellStyles = {};

  for (const [key, tone] of Object.entries(value)) {
    const parsed = parseLabCellKey(key);
    if (!parsed || !isLabCellTone(tone)) continue;
    if (parsed.rowIndex < 0 || parsed.rowIndex >= rowCount) continue;
    if (!allowedColumns.has(parsed.column)) continue;
    normalized[labCellKey(parsed.rowIndex, parsed.column)] = tone;
  }

  return normalized;
}

export function removeLabColumnStyles(styles: LabCellStyles, column: string) {
  const next: LabCellStyles = {};

  for (const [key, tone] of Object.entries(styles)) {
    const parsed = parseLabCellKey(key);
    if (!parsed || parsed.column === column) continue;
    next[labCellKey(parsed.rowIndex, parsed.column)] = tone;
  }

  return next;
}

export function shiftLabCellStylesAfterRowRemoval(
  styles: LabCellStyles,
  removedRowIndex: number,
) {
  const next: LabCellStyles = {};

  for (const [key, tone] of Object.entries(styles)) {
    const parsed = parseLabCellKey(key);
    if (!parsed || parsed.rowIndex === removedRowIndex) continue;
    const rowIndex = parsed.rowIndex > removedRowIndex ? parsed.rowIndex - 1 : parsed.rowIndex;
    next[labCellKey(rowIndex, parsed.column)] = tone;
  }

  return next;
}

function parseLabCellKey(key: string) {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex <= 0) return null;

  const rowIndex = Number.parseInt(key.slice(0, separatorIndex), 10);
  if (!Number.isInteger(rowIndex)) return null;

  try {
    return {
      rowIndex,
      column: decodeURIComponent(key.slice(separatorIndex + 1)),
    };
  } catch {
    return null;
  }
}

function isLabCellTone(value: unknown): value is LabCellTone {
  return value === "high" || value === "low";
}
