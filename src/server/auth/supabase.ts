import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can read cookies but cannot always write them.
          }
        },
      },
    },
  );
}

function getSupabaseUrl() {
  return process.env["SUPABASE_URL"] ?? process.env["NEXT_PUBLIC_SUPABASE_URL"];
}

function getSupabasePublishableKey() {
  return process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
}
