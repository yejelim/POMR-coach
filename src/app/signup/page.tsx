import Link from "next/link";
import { redirect } from "next/navigation";
import { signUpAction } from "@/app/auth/actions";
import { AppLogo } from "@/components/shared/app-logo";
import { SafetyNote } from "@/components/shared/safety-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/server/auth/current-user";
import { isSupabaseConfigured } from "@/server/auth/supabase";

const errorMessages: Record<string, string> = {
  missing: "이메일과 비밀번호를 입력해주세요.",
  password: "비밀번호는 8자 이상으로 입력해주세요.",
  confirm: "비밀번호 확인이 일치하지 않습니다.",
  consent: "학습용 사용 및 환자 식별정보 미입력 동의가 필요합니다.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (user && !user.isLocalFallback) redirect("/cases");

  const authConfigured = isSupabaseConfigured();
  const message = error ? (errorMessages[error] ?? decodeURIComponent(error)) : "";

  return (
    <main className="min-h-screen bg-app-bg px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <AppLogo size="lg" />
        </div>
        <form action={signUpAction} className="rounded-xl border border-app-border bg-app-surface p-5">
          <h1 className="text-2xl font-semibold text-app-text">Sign up</h1>
          <div className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">Email</span>
              <Input name="email" type="email" autoComplete="email" required disabled={!authConfigured} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">Password</span>
              <Input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={!authConfigured}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-app-text-secondary">Confirm password</span>
              <Input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={!authConfigured}
              />
            </label>
            <label className="flex gap-2 text-sm leading-6 text-app-text-secondary">
              <input
                name="privacyEducationConsent"
                type="checkbox"
                required
                disabled={!authConfigured}
                className="mt-1 h-4 w-4"
              />
              <span>환자 식별정보를 입력하지 않으며, POMR Coach를 학습용으로만 사용하는 것에 동의합니다.</span>
            </label>
            <label className="flex gap-2 text-sm leading-6 text-app-text-secondary">
              <input
                name="marketingEmailOptIn"
                type="checkbox"
                disabled={!authConfigured}
                className="mt-1 h-4 w-4"
              />
              <span>POMR Coach 업데이트 및 안내 메일 수신에 동의합니다.</span>
            </label>
            {message ? (
              <p className="rounded-md border border-app-warning/30 bg-app-surface-soft px-3 py-2 text-sm text-app-warning">
                {message}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={!authConfigured}>
              Create account
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-app-text-muted">
            <SafetyNote />
            <Link href="/login" className="font-medium text-app-primary">
              Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
