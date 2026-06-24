import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown = {}) {
  return new Request("http://localhost/api/ai/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/review (AI guard)", () => {
  const original = process.env.AI_ENABLED;

  beforeEach(() => {
    delete process.env.AI_ENABLED;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.AI_ENABLED;
    else process.env.AI_ENABLED = original;
  });

  it("is disabled by default and returns 503", async () => {
    const res = await POST(makeRequest({ caseId: "x", reviewType: "PROBLEM_LIST" }));
    expect(res.status).toBe(503);
  });

  it("stays disabled for any AI_ENABLED value other than exactly 'true'", async () => {
    for (const value of ["false", "1", "TRUE", "yes", ""]) {
      process.env.AI_ENABLED = value;
      const res = await POST(makeRequest({ caseId: "x", reviewType: "PROBLEM_LIST" }));
      expect(res.status, `AI_ENABLED='${value}' must not enable AI`).toBe(503);
    }
  });
});
