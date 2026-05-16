import { NextResponse } from "next/server";
import { z } from "zod";
import { runAiReview } from "@/ai/review";
import { ownerIdForQuery, requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  caseId: z.string().min(1),
  reviewType: z.enum([
    "INITIAL_IMPRESSION",
    "FINAL_IMPRESSION",
    "PROBLEM_LIST",
    "SOAP_ASSESSMENT",
  ]),
  targetId: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid review request." }, { status: 400 });
  }

  try {
    const user = await requireCurrentUser();
    const result = await runAiReview(parsed.data, ownerIdForQuery(user));
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }
    return NextResponse.json({
      reviewId: result.review.id,
      feedback: result.feedback,
      createdAt: result.review.createdAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "AI feedback failed. Check local server logs and API key settings." },
      { status: 500 },
    );
  }
}
