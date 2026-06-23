import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { createSupabaseServerClient, hasSupabaseAuthCookie, isSupabaseConfigured } from "@/server/auth/supabase";
import { serializeError } from "@/server/logging";

export type CurrentUser = {
  id: string;
  email: string | null;
  isLocalFallback: boolean;
  isAnonymous: boolean;
};

const localUser: CurrentUser = {
  id: "local-dev-user",
  email: "local@pomr-coach.dev",
  isLocalFallback: true,
  isAnonymous: false,
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return localUser;

  const cookieStore = await cookies();
  if (!hasSupabaseAuthCookie(cookieStore.getAll())) return null;

  let user;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Supabase getUser failed", serializeError(error));
      return null;
    }

    user = authUser;
  } catch (error) {
    console.error("Supabase user lookup threw", serializeError(error));
    return null;
  }

  if (!user) return null;

  const isAnonymous = Boolean((user as { is_anonymous?: boolean }).is_anonymous);
  const email = normalizeAuthEmail(user.email, isAnonymous);

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email,
      },
      update: {
        email,
      },
    });
  } catch (error) {
    console.error("Current user upsert failed", serializeError(error));
    throw error;
  }

  return {
    id: user.id,
    email,
    isLocalFallback: false,
    isAnonymous,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/guest");
  return user;
}

export function ownerIdForQuery(user: CurrentUser) {
  return user.isLocalFallback ? undefined : user.id;
}

export function normalizeAuthEmail(email: string | undefined, isAnonymous: boolean) {
  if (isAnonymous) return null;
  const trimmed = email?.trim() ?? "";
  return trimmed ? trimmed : null;
}
