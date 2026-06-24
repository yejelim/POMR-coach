// The AI review subsystem is intentionally DISABLED in the current release.
//
// The full pipeline (src/ai/review.ts -> provider.ts -> OpenAI) is kept in the
// tree but is unreachable unless AI_ENABLED is explicitly set to "true" in the
// SERVER environment. This function is the single source of truth for that gate
// — do not add ad-hoc `process.env.AI_ENABLED` checks elsewhere. The HTTP route
// (src/app/api/ai/review/route.ts) returns 503 whenever this is false, so the
// feature cannot be activated by accident (e.g. a stray client call).
//
// Re-enabling is a deliberate, server-side act and still requires hardening
// (server-side PHI screening, prompt-injection fencing) before real use.
export function isAiEnabled(): boolean {
  return process.env.AI_ENABLED === "true";
}
