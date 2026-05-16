"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/server/auth/supabase";
import { toText } from "@/lib/utils";

export async function signUpAction(formData: FormData) {
  ensureAuthConfigured();

  const email = toText(formData.get("email")).toLowerCase();
  const password = toText(formData.get("password"));
  const confirmPassword = toText(formData.get("confirmPassword"));
  const consent = formData.get("privacyEducationConsent") === "on";
  const marketingEmailOptIn = formData.get("marketingEmailOptIn") === "on";

  if (!email || !password) redirect("/signup?error=missing");
  if (password.length < 8) redirect("/signup?error=password");
  if (password !== confirmPassword) redirect("/signup?error=confirm");
  if (!consent) redirect("/signup?error=consent");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  if (data.user) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email,
        marketingEmailOptIn,
        privacyEducationConsentAt: new Date(),
      },
      update: {
        email,
        marketingEmailOptIn,
        privacyEducationConsentAt: new Date(),
      },
    });
  }

  if (!data.session) {
    redirect("/login?message=check_email");
  }

  redirect("/cases");
}

export async function signInAction(formData: FormData) {
  ensureAuthConfigured();

  const email = toText(formData.get("email")).toLowerCase();
  const password = toText(formData.get("password"));

  if (!email || !password) redirect("/login?error=missing");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  redirect("/cases");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}

function ensureAuthConfigured() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=auth_not_configured");
  }
}
