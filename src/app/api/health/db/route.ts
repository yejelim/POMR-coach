import { NextResponse } from "next/server";
import { getDatabaseUrlDiagnostics, prisma } from "@/server/db";
import { isSupabaseConfigured } from "@/server/auth/supabase";
import { canExposeHealthDetails, publicHealthError } from "@/server/health";
import { serializeError } from "@/server/logging";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const exposeDetails = canExposeHealthDetails(request);
  const databaseUrlDiagnostics = getDatabaseUrlDiagnostics();

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
      databaseUrl: exposeDetails ? databaseUrlDiagnostics : publicDatabaseUrlDiagnostics(databaseUrlDiagnostics),
      ...(exposeDetails
        ? {
            checks: {
              users: userCount,
              cases: caseCount,
              caseLibraryQuery: "ok",
            },
          }
        : {}),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed", serializeError(error));
    return NextResponse.json(
      {
        ok: false,
        database: "unreachable",
        authConfigured: isSupabaseConfigured(),
        databaseUrl: exposeDetails ? databaseUrlDiagnostics : publicDatabaseUrlDiagnostics(databaseUrlDiagnostics),
        error: publicHealthError(serializePublicError(error), exposeDetails),
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

function publicDatabaseUrlDiagnostics(diagnostics: Record<string, unknown>) {
  return {
    present: diagnostics["present"],
    kind: diagnostics["kind"],
    hasPlaceholder: diagnostics["hasPlaceholder"],
  };
}
