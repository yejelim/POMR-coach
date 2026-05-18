"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-12">
      <section className="w-full max-w-lg rounded-lg border border-app-border bg-app-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-primary">POMR Coach</p>
        <h1 className="mt-3 text-2xl font-semibold text-app-text">페이지를 다시 불러오지 못했습니다.</h1>
        <p className="mt-3 text-sm leading-6 text-app-text-muted">
          일시적인 네트워크 또는 서버 응답 문제일 수 있습니다. 다시 시도해도 반복되면 현재 작업을
          잠시 멈추고 알려주세요.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-md bg-app-surface-muted px-3 py-2 text-xs text-app-text-muted">
            Error digest: {error.digest}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={() => unstable_retry()}>
            다시 시도
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.location.assign("/cases")}>
            Case Library로 이동
          </Button>
        </div>
      </section>
    </main>
  );
}
