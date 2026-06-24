"use client";

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiAssistToggle() {
  function showComingSoon() {
    window.alert("AI assist 기능은 곧 제공될 예정입니다. 첫 배포 버전에서는 OFF 상태로 이용해주세요.");
  }

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-app-text">
        <Bot className="h-4 w-4 text-app-primary" />
        AI assist
      </div>
      <div className="flex rounded-md border border-app-border bg-app-surface-soft p-0.5">
        <Button type="button" size="sm" aria-pressed="true" className="h-7 rounded-sm px-2 shadow-none">
          OFF
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 rounded-sm px-2"
          onClick={showComingSoon}
        >
          ON
        </Button>
      </div>
    </div>
  );
}
