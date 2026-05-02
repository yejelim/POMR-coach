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
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-600" />
          <h2 className="text-base font-semibold">AI feedback</h2>
        </div>
        <Button type="button" onClick={requestReview} disabled={isPending} size="sm">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Review draft
        </Button>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-600">
        Educational note critique only. Feedback is saved locally and never overwrites your draft.
      </p>
      {message ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {message}
        </div>
      ) : null}
      {feedback ? <FeedbackView feedback={feedback} /> : null}
      {!feedback && history.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Recent feedback</h3>
          {history.map((item) => (
            <details key={item.id} className="rounded-md border border-slate-200 p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                {new Date(item.createdAt).toLocaleString()}
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.renderedText}</pre>
            </details>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function FeedbackView({ feedback }: { feedback: AiFeedback }) {
  return (
    <div className="space-y-4 text-sm leading-6">
      <p className="rounded-md bg-slate-50 p-3 text-slate-700">{feedback.summary}</p>
      <FeedbackList title="Strengths" items={feedback.strengths} />
      <FeedbackList title="Concerns" items={feedback.concerns} />
      <FeedbackList title="Missing data" items={feedback.missingData} />
      <FeedbackList title="Revision checklist" items={feedback.revisionChecklist} />
      <FeedbackList title="Safety / privacy" items={feedback.safetyPrivacyFlags} />
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-1 font-semibold text-slate-800">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-slate-700">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
