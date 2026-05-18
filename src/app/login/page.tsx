import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/auth/actions";
import { AppLogo } from "@/components/shared/app-logo";
import { SafetyNote } from "@/components/shared/safety-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/server/auth/current-user";
import { isSupabaseConfigured } from "@/server/auth/supabase";

const errorMessages: Record<string, string> = {
  missing: "이메일과 비밀번호를 입력해주세요.",
  auth_not_configured: "Supabase 환경 변수가 아직 설정되지 않았습니다.",
  guest_unavailable: "Guest mode를 시작할 수 없습니다. Supabase Anonymous Sign-Ins 설정을 확인해주세요.",
};

const statusMessages: Record<string, string> = {
  check_email: "작성하신 이메일 주소로 인증 링크가 전송되었습니다. 해당 링크로 접속하시면 회원가입이 완료됩니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [{ error, message: status }, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (user && !user.isLocalFallback && !user.isAnonymous) redirect("/cases");

  const authConfigured = isSupabaseConfigured();
  const message = error ? (errorMessages[error] ?? decodeURIComponent(error)) : "";
  const statusMessage = status ? (statusMessages[status] ?? decodeURIComponent(status)) : "";

  return (
    <main className="min-h-screen bg-app-bg px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <AppLogo size="lg" />
        </div>
        <form action={signInAction} className="rounded-xl border border-app-border bg-app-surface p-5">
          <h1 className="text-2xl font-semibold text-app-text">Login</h1>
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
                autoComplete="current-password"
                required
                disabled={!authConfigured}
              />
            </label>
            {message ? (
              <p className="rounded-md border border-app-warning/30 bg-app-surface-soft px-3 py-2 text-sm text-app-warning">
                {message}
              </p>
            ) : null}
            {statusMessage ? (
              <p className="rounded-md border border-app-success/30 bg-app-surface-soft px-3 py-2 text-sm text-app-success">
                {statusMessage}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={!authConfigured}>
              Login
            </Button>
            {authConfigured ? (
              <Button asChild variant="secondary" className="w-full">
                <Link href="/auth/guest">Guest로 계속하기</Link>
              </Button>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-app-text-muted">
            <SafetyNote />
            <Link href="/signup" className="font-medium text-app-primary">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
