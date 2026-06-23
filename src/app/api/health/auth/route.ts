import { NextResponse, type NextRequest } from "next/server";
import {
  applyAuthNoStoreHeaders,
  createSupabaseRequestClient,
  getSupabaseHost,
  getSupabaseProjectRef,
  hasSupabaseAuthCookie,
  isSupabaseConfigured,
  SUPABASE_AUTH_COOKIE_NAME,
} from "@/server/auth/supabase";
import { serializeError } from "@/server/logging";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const projectRef = getSupabaseProjectRef();
  const authCookieNames = request.cookies
    .getAll()
    .filter((cookie) => hasSupabaseAuthCookie([cookie]))
    .map(({ name, value }) => ({ name, valueLength: value.length }));

  if (!isSupabaseConfigured()) {
    return authJson({
      ok: false,
      authConfigured: false,
      supabaseHost: getSupabaseHost(),
      projectRef,
      expectedCookieName: SUPABASE_AUTH_COOKIE_NAME,
      receivedAuthCookies: authCookieNames,
      userPresent: false,
      isAnonymous: null,
      error: "Supabase environment variables are not configured.",
    });
  }

  const { supabase, applyToResponse } = createSupabaseRequestClient(request);

  try {
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    return applyToResponse(
      authJson({
        ok: !error,
        authConfigured: true,
        supabaseHost: getSupabaseHost(),
        projectRef,
        expectedCookieName: SUPABASE_AUTH_COOKIE_NAME,
        receivedAuthCookies: authCookieNames,
        userPresent: Boolean(user),
        isAnonymous: user ? Boolean((user as { is_anonymous?: boolean }).is_anonymous) : null,
        error: error
          ? {
              name: error.name,
              message: error.message,
              status: "status" in error ? error.status : null,
              code: "code" in error ? error.code : null,
            }
          : null,
      }),
    );
  } catch (error) {
    console.error("Auth health check failed", serializeError(error));
    return applyToResponse(
      authJson(
        {
          ok: false,
          authConfigured: true,
          supabaseHost: getSupabaseHost(),
          projectRef,
          expectedCookieName: SUPABASE_AUTH_COOKIE_NAME,
          receivedAuthCookies: authCookieNames,
          userPresent: false,
          isAnonymous: null,
          error: serializePublicError(error),
        },
        500,
      ),
    );
  }
}

function authJson(body: Record<string, unknown>, status = 200) {
  return applyAuthNoStoreHeaders(NextResponse.json(body, { status }));
}

function serializePublicError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown auth error";
  return `${error.name}: ${error.message}`;
}
