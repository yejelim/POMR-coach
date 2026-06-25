import { describe, expect, it } from "vitest";
import {
  isValidImageDataUrl,
  MAX_IMAGE_BYTES,
  sanitizeImagesForStorage,
} from "@/lib/image-limits";

const tinyPng = "data:image/png;base64,iVBORw0KGgo=";

describe("isValidImageDataUrl", () => {
  it("accepts png/jpeg/webp base64 data URLs", () => {
    expect(isValidImageDataUrl(tinyPng)).toBe(true);
    expect(isValidImageDataUrl("data:image/jpeg;base64,AAAA")).toBe(true);
    expect(isValidImageDataUrl("data:image/webp;base64,AAAA")).toBe(true);
  });

  it("rejects external URLs, non-image data URLs, and non-strings", () => {
    expect(isValidImageDataUrl("https://evil.example/track.png")).toBe(false);
    expect(isValidImageDataUrl("data:text/html;base64,AAAA")).toBe(false);
    expect(isValidImageDataUrl(null)).toBe(false);
    expect(isValidImageDataUrl(123)).toBe(false);
  });
});

describe("sanitizeImagesForStorage", () => {
  it("keeps valid images and drops invalid/external ones", () => {
    const result = sanitizeImagesForStorage([
      { dataUrl: tinyPng },
      { dataUrl: "https://evil.example/track.png" },
      { dataUrl: "data:text/html;base64,AAAA" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].dataUrl).toBe(tinyPng);
  });

  it("drops images that exceed the per-image byte limit", () => {
    const oversized = "data:image/png;base64," + "A".repeat(Math.ceil(((MAX_IMAGE_BYTES + 1024) * 4) / 3));
    const result = sanitizeImagesForStorage([{ dataUrl: oversized }, { dataUrl: tinyPng }]);
    expect(result.map((i) => i.dataUrl)).toEqual([tinyPng]);
  });

  it("returns [] for non-array input", () => {
    expect(sanitizeImagesForStorage(null as unknown as { dataUrl?: unknown }[])).toEqual([]);
  });
});
