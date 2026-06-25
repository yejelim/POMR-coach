// Single source of truth for reading Supabase configuration from the environment.
// Kept free of any `next/*` imports so it can be imported anywhere on the server
// (including src/server/db.ts) without pulling in request-scoped modules.

export function getSupabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabasePublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

// Escape hatch for a SINGLE-USER, private, no-real-data deployment: permit the
// shared local-fallback identity on Postgres, skipping the Supabase auth
// requirement. WARNING: this turns OFF per-user data isolation — every visitor
// shares one identity and sees the same notes. NEVER enable on a multi-user or
// public deployment. Default (unset) keeps the secure fail-closed behavior.
export function allowSharedLocalIdentity() {
  return process.env.ALLOW_SHARED_LOCAL_IDENTITY === "true";
}
