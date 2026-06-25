import { NextResponse } from "next/server";
import { z } from "zod";
import { isAiEnabled } from "@/ai/flags";
import { getCurrentUser, ownerIdForQuery } from "@/server/auth/current-user";
import { serializeError } from "@/server/logging";
import type { AiReviewType } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  caseId: z.string().min(1),
  reviewType: z.enum([
    "INITIAL_IMPRESSION",
    "FINAL_IMPRESSION",
    "PROBLEM_LIST",
    "SOAP_ASSESSMENT",
  ]),
  targetId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  // Hard guard: the AI subsystem is off unless explicitly enabled server-side.
  // This is checked before any auth/DB work so a disabled deployment is inert.
  if (!isAiEnabled()) {
    return NextResponse.json(
      { message: "AI assist 기능은 현재 비활성화되어 있습니다." },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid review request." }, { status: 400 });
  }

  try {
    // Lazy-import so the (heavy) OpenAI-backed pipeline is never loaded while disabled.
    const { runAiReview } = await import("@/ai/review");
    const result = await runAiReview(
      parsed.data as { caseId: string; reviewType: AiReviewType; targetId?: string },
      ownerIdForQuery(user),
    );

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json({
      feedback: result.feedback,
      review: {
        id: result.review.id,
        createdAt: result.review.createdAt,
        renderedText: result.review.renderedText,
      },
    });
  } catch (error) {
    console.error("AI review failed", serializeError(error));
    return NextResponse.json({ message: "AI review failed." }, { status: 502 });
  }
}
