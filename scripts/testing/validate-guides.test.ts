import { describe, expect, it } from "vitest";
import { REQUIRED_SECTIONS, validateGuide, validateGuidesDir } from "./validate-guides.mts";

const complete = REQUIRED_SECTIONS.join("\n\ncontent\n\n");

describe("guide contract", () => {
  it("accepts a guide with every required section", () => {
    expect(validateGuide(complete)).toEqual([]);
  });

  it("reports each missing section", () => {
    const problems = validateGuide("## Scope\nonly scope");
    expect(problems.some((p) => p.includes("Preconditions"))).toBe(true);
    expect(problems.some((p) => p.includes("Manual checks"))).toBe(true);
  });

  it("validates the committed guides directory", () => {
    expect(validateGuidesDir(process.cwd())).toEqual([]);
  });
});
