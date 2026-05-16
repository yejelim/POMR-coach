"use client";

import { Bot, Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { AiFeedback, AiReviewType } from "@/lib/types";

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
  caseId,
  reviewType,
  targetId,
  history,
}: {
  caseId: string;
  reviewType: AiReviewType;
  targetId?: string;
  history: ReviewHistory[];
}) {
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestReview() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, reviewType, targetId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "Review failed.");
        return;
      }
      setFeedback(data.feedback);
    });
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
        <Button type="button" onClick={requestReview} disabled={isPending} size="sm" variant="secondary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {reviewButtonLabels[reviewType]}
        </Button>
      </div>
      {message ? (
        <div className="mb-4 rounded-md border border-app-warning/30 bg-app-surface p-3 text-sm text-app-warning">
          {message}
        </div>
      ) : null}
      {feedback ? <FeedbackView feedback={feedback} /> : null}
      {!feedback && history.length ? (
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

function FeedbackView({ feedback }: { feedback: AiFeedback }) {
  return (
    <div className="space-y-4 text-sm leading-6">
      <p className="rounded-md border border-app-ai-border bg-app-surface/70 p-3 text-app-ai-text">{feedback.summary}</p>
      <FeedbackList title="Strengths" items={feedback.strengths} />
      <FeedbackList title="Missing data" items={feedback.missingData} />
      <FeedbackList title="Reasoning concerns" items={feedback.concerns} />
      <FeedbackList title="Suggested revision" items={feedback.revisionChecklist} />
      <FeedbackList title="Teaching points" items={feedback.safetyPrivacyFlags} />
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-1 font-semibold text-app-ai-text">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-app-text-secondary">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
