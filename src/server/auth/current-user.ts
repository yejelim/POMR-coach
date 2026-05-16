import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/server/auth/supabase";

export type CurrentUser = {
  id: string;
  email: string;
  isLocalFallback: boolean;
};

const localUser: CurrentUser = {
  id: "local-dev-user",
  email: "local@pomr-coach.dev",
  isLocalFallback: true,
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return localUser;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
    },
    update: {
      email: user.email,
    },
  });

  return {
    id: user.id,
    email: user.email,
    isLocalFallback: false,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function ownerIdForQuery(user: CurrentUser) {
  return user.isLocalFallback ? undefined : user.id;
}
