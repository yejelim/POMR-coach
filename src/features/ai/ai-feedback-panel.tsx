"use client";

import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AiReviewType } from "@/lib/types";

type ReviewHistory = {
  id: string;
  createdAt: Date | string;
  renderedText: string;
};

const reviewButtonLabels: Record<AiReviewType, string> = {
  INITIAL_IMPRESSION: "Initial impression 피드백 받기",
  FINAL_IMPRESSION: "Final impression 피드백 받기",
  PROBLEM_LIST: "Problem list 피드백 받기",
  SOAP_ASSESSMENT: "Assessment 피드백 받기",
};

export function AiFeedbackPanel({
  reviewType,
  history,
}: {
  caseId: string;
  reviewType: AiReviewType;
  targetId?: string;
  history: ReviewHistory[];
}) {
  const [message, setMessage] = useState<string | null>(null);

  function requestReview() {
    setMessage("AI assist 기능은 곧 제공될 예정입니다. 첫 배포 버전에서는 작성/저장/export 기능을 먼저 제공합니다.");
  }

  return (
    <aside className="rounded-xl border border-app-ai-border bg-app-ai-surface p-4 text-app-ai-text shadow-none lg:sticky lg:top-6 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-app-ai-border bg-app-surface text-app-primary">
            <Bot className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-app-ai-text">Coach Feedback</h2>
          </div>
        </div>
        <Button type="button" onClick={requestReview} size="sm" variant="secondary">
          <Sparkles className="h-4 w-4" />
          {reviewButtonLabels[reviewType]}
        </Button>
      </div>
      <div className="mb-4 rounded-md border border-app-ai-border bg-app-surface/70 p-3 text-sm leading-6 text-app-text-secondary">
        첫 배포 버전에서는 AI assist가 OFF 상태입니다. 사용자가 직접 작성한 내용을 저장하고 export하는 기능을 우선 제공합니다.
      </div>
      {message ? (
        <div className="mb-4 rounded-md border border-app-warning/30 bg-app-surface p-3 text-sm text-app-warning">
          {message}
        </div>
      ) : null}
      {history.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-app-ai-text">Recent feedback</h3>
          {history.map((item) => (
            <details key={item.id} className="rounded-md border border-app-ai-border bg-app-surface/70 p-3">
              <summary className="cursor-pointer text-sm font-medium text-app-ai-text">
                {formatReviewTimestamp(item.createdAt)}
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-app-text-secondary">{item.renderedText}</pre>
            </details>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function formatReviewTimestamp(value: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
