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
import { publicHealthError, shouldExposeHealthDetails } from "@/server/health";
import { serializeError } from "@/server/logging";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const exposeDetails = shouldExposeHealthDetails();
  const projectRef = getSupabaseProjectRef();
  const authCookieNames = request.cookies
    .getAll()
    .filter((cookie) => hasSupabaseAuthCookie([cookie]))
    .map(({ name, value }) => ({ name, valueLength: value.length }));

  if (!isSupabaseConfigured()) {
    return authJson({
      ok: false,
      authConfigured: false,
      sessionCookiePresent: authCookieNames.length > 0,
      userPresent: false,
      isAnonymous: null,
      error: "Supabase environment variables are not configured.",
      ...(exposeDetails
        ? {
            supabaseHost: getSupabaseHost(),
            projectRef,
            expectedCookieName: SUPABASE_AUTH_COOKIE_NAME,
            receivedAuthCookies: authCookieNames,
          }
        : {}),
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
        sessionCookiePresent: authCookieNames.length > 0,
        userPresent: Boolean(user),
        isAnonymous: user ? Boolean((user as { is_anonymous?: boolean }).is_anonymous) : null,
        error: error
          ? exposeDetails
            ? {
                name: error.name,
                message: error.message,
                status: "status" in error ? error.status : null,
                code: "code" in error ? error.code : null,
              }
            : "Auth check failed."
          : null,
        ...(exposeDetails
          ? {
              supabaseHost: getSupabaseHost(),
              projectRef,
              expectedCookieName: SUPABASE_AUTH_COOKIE_NAME,
              receivedAuthCookies: authCookieNames,
            }
          : {}),
      }),
    );
  } catch (error) {
    console.error("Auth health check failed", serializeError(error));
    return applyToResponse(
      authJson(
        {
          ok: false,
          authConfigured: true,
          sessionCookiePresent: authCookieNames.length > 0,
          userPresent: false,
          isAnonymous: null,
          error: publicHealthError(serializePublicError(error)),
          ...(exposeDetails
            ? {
                supabaseHost: getSupabaseHost(),
                projectRef,
                expectedCookieName: SUPABASE_AUTH_COOKIE_NAME,
                receivedAuthCookies: authCookieNames,
              }
            : {}),
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
