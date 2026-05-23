"use client";

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiAssistToggle() {
  function showComingSoon() {
    window.alert("AI assist 기능은 곧 제공될 예정입니다. 첫 배포 버전에서는 OFF 상태로 이용해주세요.");
  }

  return (
    <div className="rounded-lg border border-app-border bg-app-surface p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-app-text">
        <Bot className="h-4 w-4 text-app-primary" />
        AI assist
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" size="sm" aria-pressed="true">
          OFF
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={showComingSoon}>
          ON
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-app-text-muted">
        첫 배포 버전에서는 AI assist 없이 작성/저장/export 기능을 제공합니다.
      </p>
    </div>
  );
}
