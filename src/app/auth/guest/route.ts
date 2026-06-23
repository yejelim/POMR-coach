import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { normalizeAuthEmail } from "@/server/auth/current-user";
import { applyAuthNoStoreHeaders, createSupabaseRequestClient, isSupabaseConfigured } from "@/server/auth/supabase";
import { serializeError } from "@/server/logging";
import { getPublicUrl } from "@/server/request-url";

function getSafeNextUrl(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return getPublicUrl(request, "/cases");
  }

  return getPublicUrl(request, next);
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return applyAuthNoStoreHeaders(NextResponse.redirect(getSafeNextUrl(request)));
    }

    const { supabase, applyToResponse } = createSupabaseRequestClient(request);
    const {
      data: { user: existingUser },
    } = await supabase.auth.getUser();

    if (existingUser) {
      return applyToResponse(applyAuthNoStoreHeaders(NextResponse.redirect(getSafeNextUrl(request))));
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error || !data.user) {
      console.error("Guest sign-in failed", {
        message: error?.message,
        status: error?.status,
        code: error?.code,
      });
      const loginUrl = getPublicUrl(request, "/login");
      loginUrl.searchParams.set("error", "guest_unavailable");
      return applyToResponse(applyAuthNoStoreHeaders(NextResponse.redirect(loginUrl)));
    }

    const isAnonymous = Boolean((data.user as { is_anonymous?: boolean }).is_anonymous);
    const email = normalizeAuthEmail(data.user.email, isAnonymous);

    await prisma.user.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email,
      },
      update: {
        email,
      },
    });

    return applyToResponse(applyAuthNoStoreHeaders(NextResponse.redirect(getSafeNextUrl(request))));
  } catch (error) {
    console.error("Guest route failed", serializeError(error));
    const loginUrl = getPublicUrl(request, "/login");
    loginUrl.searchParams.set("error", "guest_unavailable");
    return applyAuthNoStoreHeaders(NextResponse.redirect(loginUrl));
  }
}
