import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { isSupabaseConfigured } from "@/server/auth/supabase";
import { serializeError } from "@/server/logging";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [userCount, caseCount] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
    ]);
    await prisma.case.findMany({
      take: 1,
      include: { tags: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      database: "reachable",
      authConfigured: isSupabaseConfigured(),
      checks: {
        users: userCount,
        cases: caseCount,
        caseLibraryQuery: "ok",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed", serializeError(error));
    return NextResponse.json(
      {
        ok: false,
        database: "unreachable",
        authConfigured: isSupabaseConfigured(),
        error: serializePublicError(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

function serializePublicError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown database error";
  return `${error.name}: ${error.message}`;
}
