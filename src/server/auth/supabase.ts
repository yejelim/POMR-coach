import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookieOptions: getSupabaseCookieOptions(),
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

export function createSupabaseRequestClient(request: NextRequest) {
  const pendingCookies: CookieToSet[] = [];
  const pendingHeaders = new Headers();

  const supabase = createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookieOptions: getSupabaseCookieOptions(),
      cookies: {
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
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function hasSupabaseAuthCookie(cookieList: { name: string }[]) {
  return cookieList.some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));
}

function getSupabaseUrl() {
  return process.env["SUPABASE_URL"] ?? process.env["NEXT_PUBLIC_SUPABASE_URL"];
}

function getSupabasePublishableKey() {
  return process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
}
