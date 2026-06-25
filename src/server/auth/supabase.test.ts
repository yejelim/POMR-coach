import { describe, expect, it } from "vitest";
import { hasSupabaseAuthCookie } from "@/server/auth/supabase";

describe("hasSupabaseAuthCookie", () => {
  it("matches the base session cookie", () => {
    expect(hasSupabaseAuthCookie([{ name: "__session" }])).toBe(true);
  });

  it("matches chunked session cookies (large sessions)", () => {
    expect(hasSupabaseAuthCookie([{ name: "__session.0" }])).toBe(true);
    expect(hasSupabaseAuthCookie([{ name: "__session.1" }])).toBe(true);
  });

  it("matches the legacy sb-*-auth-token format", () => {
    expect(hasSupabaseAuthCookie([{ name: "sb-abcdef-auth-token" }])).toBe(true);
    expect(hasSupabaseAuthCookie([{ name: "sb-abcdef-auth-token.0" }])).toBe(true);
  });

  it("ignores unrelated cookies, including lookalikes", () => {
    expect(
      hasSupabaseAuthCookie([{ name: "theme" }, { name: "foo.0" }, { name: "session" }]),
    ).toBe(false);
  });
});
