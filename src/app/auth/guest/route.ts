import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { normalizeAuthEmail } from "@/server/auth/current-user";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/server/auth/supabase";

function getSafeNextUrl(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return new URL("/cases", request.url);
  }

  return new URL(next, request.url);
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(getSafeNextUrl(request));
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    return NextResponse.redirect(getSafeNextUrl(request));
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "guest_unavailable");
    return NextResponse.redirect(loginUrl);
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

  return NextResponse.redirect(getSafeNextUrl(request));
}
