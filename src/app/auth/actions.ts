"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/server/auth/supabase";
import { toText } from "@/lib/utils";
import { serializeError } from "@/server/logging";

export async function signUpAction(formData: FormData) {
  ensureAuthConfigured();

  const email = toText(formData.get("email")).trim().toLowerCase();
  const password = toText(formData.get("password"));
  const confirmPassword = toText(formData.get("confirmPassword"));
  const consent = formData.get("privacyEducationConsent") === "on";
  const marketingEmailOptIn = formData.get("marketingEmailOptIn") === "on";

  if (!email || !password) redirect("/signup?error=missing");
  if (password.length < 8) redirect("/signup?error=password");
  if (password !== confirmPassword) redirect("/signup?error=confirm");
  if (!consent) redirect("/signup?error=consent");

  // Note: we intentionally do NOT pre-check the local User table for this email.
  // An unauthenticated existence probe is an account-enumeration vector; let
  // Supabase be the single source of truth for whether the account already exists.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentAuthUser },
    error: currentUserError,
  } = await supabase.auth.getUser();

  if (currentUserError) {
    console.error("Signup current user lookup failed", serializeError(currentUserError));
  }

  if (currentAuthUser) {
    const isAnonymous = Boolean((currentAuthUser as { is_anonymous?: boolean }).is_anonymous);
    if (!isAnonymous) redirect("/cases");

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Signup anonymous signout failed", serializeError(signOutError));
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup failed", serializeError(error));
    redirect(`/signup?error=${isExistingAccountError(error.message) ? "account_exists" : "signup_failed"}`);
  }

  if (data.user) {
    if (looksLikeExistingSupabaseUser(data.user)) {
      redirect("/signup?error=account_exists");
    }

    try {
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
    } catch (error) {
      console.error("Signup user upsert failed", serializeError(error));
      redirect(`/signup?error=${isPrismaUniqueError(error) ? "account_exists" : "signup_failed"}`);
    }
  }

  if (!data.session) {
    redirect("/login?message=check_email");
  }

  redirect("/cases");
}

export async function signInAction(formData: FormData) {
  ensureAuthConfigured();

  const email = toText(formData.get("email")).trim().toLowerCase();
  const password = toText(formData.get("password"));

  if (!email || !password) redirect("/login?error=missing");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentAuthUser },
  } = await supabase.auth.getUser();

  if (currentAuthUser && Boolean((currentAuthUser as { is_anonymous?: boolean }).is_anonymous)) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Signin anonymous signout failed", serializeError(signOutError));
    }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Signin failed", serializeError(error));
    redirect(`/login?error=${isInvalidLoginError(error.message) ? "invalid_login" : "login_failed"}`);
  }

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

function isExistingAccountError(message = "") {
  const normalized = message.toLowerCase();
  return normalized.includes("already") || normalized.includes("registered") || normalized.includes("exists");
}

function isInvalidLoginError(message = "") {
  const normalized = message.toLowerCase();
  return normalized.includes("invalid") || normalized.includes("credential") || normalized.includes("login");
}

function looksLikeExistingSupabaseUser(user: { identities?: unknown[] }) {
  return Array.isArray(user.identities) && user.identities.length === 0;
}

function isPrismaUniqueError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2002");
}
