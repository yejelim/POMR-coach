import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AuthStatus({
  email,
  isLocalFallback,
  isAnonymous = false,
}: {
  email: string | null;
  isLocalFallback: boolean;
  isAnonymous?: boolean;
}) {
  if (isLocalFallback) {
    return <p className="text-xs text-app-text-muted">Local mode</p>;
  }

  if (isAnonymous) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
        <span className="font-medium text-app-primary">Guest mode</span>
        <span>계정 저장 전까지 게스트 기록은 현재 세션에 보관됩니다.</span>
        <Link href="/login" className="font-medium text-app-primary">
          Login
        </Link>
        <Link href="/signup" className="font-medium text-app-primary">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
      <span className="truncate">{email ?? "Signed in"}</span>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Logout
        </Button>
      </form>
      <span>공용 컴퓨터에서는 사용 후 로그아웃하세요.</span>
    </div>
  );
}
