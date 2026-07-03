"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { currentRelease } from "@/config/releases";
import { Button } from "@/components/ui/button";

const SEEN_KEY = "pomr-coach:release-seen";
const SNOOZE_KEY = "pomr-coach:release-snoozed-date";

export function ReleaseUpdateDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const seenVersion = window.localStorage.getItem(SEEN_KEY);
      const snoozedDate = window.localStorage.getItem(SNOOZE_KEY);

      if (seenVersion === currentRelease.version) return;
      if (snoozedDate === getLocalDateKey()) return;

      setOpen(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!open) return null;

  function markSeen() {
    window.localStorage.setItem(SEEN_KEY, currentRelease.version);
    window.localStorage.removeItem(SNOOZE_KEY);
    setOpen(false);
  }

  function snoozeToday() {
    window.localStorage.setItem(SNOOZE_KEY, getLocalDateKey());
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]"
      role="presentation"
    >
      <section
        aria-labelledby="release-update-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-5 shadow-2xl shadow-slate-950/20"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-primary">
              POMR Coach {currentRelease.version}
            </p>
            <h2 id="release-update-title" className="mt-1 text-xl font-semibold text-app-text">
              {currentRelease.title}
            </h2>
            <p className="mt-1 text-xs text-app-text-muted">{currentRelease.date}</p>
          </div>
          <button
            aria-label="업데이트 안내 닫기"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-app-text-muted transition hover:bg-app-surface-soft hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/25"
            type="button"
            onClick={markSeen}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 rounded-xl border border-app-primary-soft bg-app-primary-muted px-4 py-3 text-sm leading-6 text-app-text-secondary">
          {currentRelease.body}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={snoozeToday}>
            오늘 보지 않기
          </Button>
          <Button type="button" onClick={markSeen}>
            확인했어요
          </Button>
        </div>
      </section>
    </div>
  );
}

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
