import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { applyAuthNoStoreHeaders, getSupabaseCookieOptions, hasSupabaseAuthCookie } from "@/server/auth/supabase";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/server/auth/supabase-env";
import { serializeError } from "@/server/logging";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const requestCookies = request.cookies.getAll();
  const hasAuthCookie = hasSupabaseAuthCookie(requestCookies);

  if (!hasAuthCookie) {
    return response;
  }

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

          response = NextResponse.next({ request });

          Object.entries(headers).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
          if (cookiesToSet.length > 0) {
            applyAuthNoStoreHeaders(response);
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  try {
    const { error } = await supabase.auth.getUser();
    if (error) {
      console.error("Supabase proxy getUser failed", serializeError(error));
    }
  } catch (error) {
    console.error("Supabase proxy threw", serializeError(error));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|POMR_coach_logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
