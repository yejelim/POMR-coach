import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/server/auth/supabase-env";

export { getSupabasePublishableKey, getSupabaseUrl, isSupabaseConfigured };

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

const AUTH_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
};

export const SUPABASE_AUTH_COOKIE_NAME = "__session";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookieOptions: getSupabaseCookieOptions(),
      cookies: {
        encode: "tokens-only",
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

export function createSupabaseRequestClient(request: NextRequest) {
  const pendingCookies: CookieToSet[] = [];
  const pendingHeaders = new Headers();

  const supabase = createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookieOptions: getSupabaseCookieOptions(),
      cookies: {
        encode: "tokens-only",
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers = {}) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          pendingCookies.push(...cookiesToSet);
          Object.entries(headers).forEach(([name, value]) => {
            pendingHeaders.set(name, value);
          });
        },
      },
    },
  );

  return {
    supabase,
    applyToResponse(response: NextResponse) {
      pendingHeaders.forEach((value, name) => {
        response.headers.set(name, value);
      });
      if (pendingCookies.length > 0) {
        applyAuthNoStoreHeaders(response);
      }
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    },
  };
}

export function applyAuthNoStoreHeaders(response: NextResponse) {
  Object.entries(AUTH_RESPONSE_HEADERS).forEach(([name, value]) => {
    response.headers.set(name, value);
  });
  return response;
}

export function getSupabaseProjectRef() {
  const host = getSupabaseHost();
  return host?.endsWith(".supabase.co") ? host.split(".")[0] : null;
}

export function getSupabaseHost() {
  const url = getSupabaseUrl();
  if (!url) return null;

  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function getSupabaseCookieOptions() {
  return {
    name: SUPABASE_AUTH_COOKIE_NAME,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function hasSupabaseAuthCookie(cookieList: { name: string }[]) {
  return cookieList.some(({ name }) => isSupabaseAuthCookieName(name));
}

function isSupabaseAuthCookieName(name: string) {
  // @supabase/ssr splits large sessions into chunked cookies (`__session.0`,
  // `__session.1`, ...). Match the base name, its chunks, and the legacy format
  // so a user with a large session is never treated as logged out.
  return (
    name === SUPABASE_AUTH_COOKIE_NAME ||
    name.startsWith(`${SUPABASE_AUTH_COOKIE_NAME}.`) ||
    isLegacySupabaseAuthCookie(name)
  );
}

function isLegacySupabaseAuthCookie(name: string) {
  return name.startsWith("sb-") && name.includes("auth-token");
}
