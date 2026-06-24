// Shared image-attachment limits, used by BOTH the client editor (friendly,
// up-front errors) and the server (authoritative backstop). Keeping one source
// of truth means the guarantee in the UI is actually enforced where it matters.

export const ALLOWED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image
export const MAX_SECTION_BYTES = 10 * 1024 * 1024; // 10MB total per section
export const MAX_IMAGES_PER_SECTION = 24; // generous hard cap to bound abuse

// Only accept base64 data URLs for the allowed image types. This rejects, in
// particular, external URLs (e.g. https://… tracking pixels) and non-image data
// URLs that must never be fetched/rendered in an exported clinical document.
const ALLOWED_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp);base64,/i;

export function isValidImageDataUrl(dataUrl: unknown): dataUrl is string {
  return typeof dataUrl === "string" && ALLOWED_IMAGE_DATA_URL.test(dataUrl);
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

/**
 * Server-side backstop: keep only valid data:image URLs within the per-image,
 * per-section, and count limits. Drops offending entries rather than throwing so
 * a single bad image never destroys the surrounding note. The client enforces the
 * same limits up front with user-facing errors.
 */
export function sanitizeImagesForStorage<T extends { dataUrl?: unknown }>(images: T[]): T[] {
  if (!Array.isArray(images)) return [];
  const out: T[] = [];
  let total = 0;
  for (const image of images) {
    if (out.length >= MAX_IMAGES_PER_SECTION) break;
    if (!isValidImageDataUrl(image?.dataUrl)) continue;
    const bytes = estimateDataUrlBytes(image.dataUrl);
    if (bytes > MAX_IMAGE_BYTES) continue;
    if (total + bytes > MAX_SECTION_BYTES) continue;
    total += bytes;
    out.push(image);
  }
  return out;
}
