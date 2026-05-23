import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { message: "AI assist 기능은 첫 배포 버전에서 제공되지 않습니다." },
    { status: 503 },
  );
}
