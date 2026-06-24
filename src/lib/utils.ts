import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toInt(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return coerceToShape(JSON.parse(String(value)), fallback);
  } catch {
    return fallback;
  }
}

export function parseStoredJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return coerceToShape(value, fallback);
  try {
    return coerceToShape(JSON.parse(value), fallback);
  } catch {
    return fallback;
  }
}

// Guards against valid-JSON-but-wrong-shape: a syntactically valid value of the
// wrong type (e.g. `"{}"` where an array is expected) would otherwise pass the
// try/catch and crash a downstream `.map`/`.filter` at render time. Coerce to the
// fallback unless the parsed value matches the fallback's basic shape.
function coerceToShape<T>(parsed: unknown, fallback: T): T {
  if (Array.isArray(fallback)) {
    return (Array.isArray(parsed) ? parsed : fallback) as T;
  }
  if (fallback !== null && typeof fallback === "object") {
    const isPlainObject = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
    return (isPlainObject ? parsed : fallback) as T;
  }
  return (typeof parsed === typeof fallback ? parsed : fallback) as T;
}

export function stringifyStoredJson(value: unknown, fallback: unknown = {}) {
  return JSON.stringify(value ?? fallback);
}

// Format a timestamp in Korea time regardless of the host/server locale, so
// "last saved" reads consistently for users (Server Components otherwise format
// in the host's timezone, e.g. UTC on Cloud Run).
export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function stableHash(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
