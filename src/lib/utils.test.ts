import { describe, expect, it } from "vitest";
import { parseJsonField, parseStoredJson, stringifyStoredJson } from "@/lib/utils";

describe("parseStoredJson", () => {
  it("parses valid JSON matching the array fallback", () => {
    expect(parseStoredJson("[1,2]", [] as number[])).toEqual([1, 2]);
  });

  it("returns the fallback for valid JSON of the wrong shape (the crash bug)", () => {
    // object where an array is expected — would otherwise crash a later .map
    expect(parseStoredJson("{}", [] as unknown[])).toEqual([]);
    // array where an object is expected
    expect(parseStoredJson("[]", { a: 1 })).toEqual({ a: 1 });
  });

  it("returns the fallback for invalid JSON and empty/null/undefined", () => {
    expect(parseStoredJson("{bad", [])).toEqual([]);
    expect(parseStoredJson("", [])).toEqual([]);
    expect(parseStoredJson(null, [])).toEqual([]);
    expect(parseStoredJson(undefined, [])).toEqual([]);
  });

  it("handles already-parsed (non-string) values with the same shape guard", () => {
    expect(parseStoredJson([1], [] as number[])).toEqual([1]);
    expect(parseStoredJson({ a: 1 }, {} as Record<string, number>)).toEqual({ a: 1 });
    expect(parseStoredJson({ a: 1 }, [] as unknown[])).toEqual([]);
  });
});

describe("parseJsonField", () => {
  it("parses array form values and rejects wrong shapes", () => {
    expect(parseJsonField("[1]", [] as number[])).toEqual([1]);
    expect(parseJsonField("{}", [] as unknown[])).toEqual([]);
    expect(parseJsonField(null, [])).toEqual([]);
  });
});

describe("stringifyStoredJson", () => {
  it("uses the provided fallback for nullish values", () => {
    expect(stringifyStoredJson(null, [])).toBe("[]");
    expect(stringifyStoredJson(undefined)).toBe("{}");
    expect(stringifyStoredJson([1, 2], [])).toBe("[1,2]");
  });
});
