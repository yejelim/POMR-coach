import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function AuthStatus({
  email,
  isLocalFallback,
}: {
  email: string;
  isLocalFallback: boolean;
}) {
  if (isLocalFallback) {
    return <p className="text-xs text-app-text-muted">Local mode</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
      <span className="truncate">{email}</span>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Logout
        </Button>
      </form>
      <span>공용 컴퓨터에서는 사용 후 로그아웃하세요.</span>
    </div>
  );
}
