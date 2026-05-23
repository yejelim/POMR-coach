import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AuthStatus({
  email,
  isLocalFallback,
  isAnonymous = false,
  variant = "panel",
}: {
  email: string | null;
  isLocalFallback: boolean;
  isAnonymous?: boolean;
  variant?: "panel" | "compact";
}) {
  if (isLocalFallback) {
    return (
      <span className="inline-flex h-8 items-center rounded-md border border-app-border bg-app-surface px-2.5 text-xs font-medium text-app-text-muted">
        Local mode
      </span>
    );
  }

  if (isAnonymous) {
    if (variant === "compact") {
      return (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-app-warning/25 bg-amber-50 px-3 py-2">
          <span className="rounded-full bg-app-warning px-2 py-0.5 text-xs font-semibold text-white">
            Guest
          </span>
          <span className="text-xs font-medium text-amber-900">
            게스트 기록은 사라질 수 있습니다.
          </span>
          <Button asChild size="sm" className="h-7 px-2">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7 px-2">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-app-warning/25 bg-amber-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-app-warning px-2 py-0.5 text-xs font-semibold text-white">
            Guest mode
          </span>
          <span className="text-xs font-medium text-amber-900">
            게스트 기록은 세션/브라우저 상태에 따라 사라질 수 있습니다.
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-amber-800">
          계속 사용할 케이스라면 계정을 만들어 저장하는 것을 권장합니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex min-w-0 items-center gap-2 rounded-md border border-app-border bg-app-surface px-2 py-1.5">
        <span className="max-w-48 truncate text-xs font-medium text-app-text-muted">
          {email ?? "Signed in"}
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm" className="h-7 px-2">
            Logout
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-app-border bg-app-surface p-3">
      <div className="mb-2 text-xs font-medium text-app-text-muted">
        Signed in as <span className="text-app-text">{email ?? "account user"}</span>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Logout
        </Button>
      </form>
      <p className="mt-2 text-xs leading-5 text-app-text-muted">공용 컴퓨터에서는 사용 후 로그아웃하세요.</p>
    </div>
  );
}
