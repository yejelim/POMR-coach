import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { isSupabaseConfigured } from "@/server/auth/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.user.count();
    return NextResponse.json({
      ok: true,
      database: "reachable",
      authConfigured: isSupabaseConfigured(),
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

function serializeError(error: unknown) {
  if (!(error instanceof Error)) return { error };
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: "code" in error ? error.code : undefined,
    clientVersion: "clientVersion" in error ? error.clientVersion : undefined,
  };
}

