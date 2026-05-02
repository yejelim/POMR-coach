import { describe, expect, it } from "vitest";
import { reviewInitialImpressionPrompt } from "./reviewInitialImpression";

describe("initial impression prompt", () => {
  it("keeps the review scoped to pre-test reasoning and JSON feedback", () => {
    const prompt = reviewInitialImpressionPrompt({
      caseText: "CC: RUQ pain",
      initialImpressionText: "#1 biliary obstruction",
    });

    expect(prompt).toContain("PRE-TEST");
    expect(prompt).toContain("Hx/ROS/PE");
    expect(prompt).toContain("Return JSON");
  });
});
