import { NextResponse, type NextRequest } from "next/server";
import {
  applyAuthNoStoreHeaders,
  createSupabaseRequestClient,
  hasSupabaseAuthCookie,
  isSupabaseConfigured,
} from "@/server/auth/supabase";
import { canExposeHealthDetails, publicHealthError } from "@/server/health";
import { serializeError } from "@/server/logging";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const exposeDetails = canExposeHealthDetails(request);
  // Only a boolean — never reflect cookie names, values, or lengths to anonymous callers.
  const sessionCookiePresent = request.cookies
    .getAll()
    .some((cookie) => hasSupabaseAuthCookie([cookie]));

  if (!isSupabaseConfigured()) {
    return authJson({
      ok: false,
      authConfigured: false,
      sessionCookiePresent,
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
        sessionCookiePresent,
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
      }),
    );
  } catch (error) {
    console.error("Auth health check failed", serializeError(error));
    return applyToResponse(
      authJson(
        {
          ok: false,
          authConfigured: true,
          sessionCookiePresent,
          userPresent: false,
          isAnonymous: null,
          error: publicHealthError(serializePublicError(error), exposeDetails),
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
