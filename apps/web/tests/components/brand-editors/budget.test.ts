import { describe, expect, it } from "vitest";

import { parseBudgetGbp } from "../../../lib/copy/brand-editors";

describe("parseBudgetGbp", () => {
  it("accepts whole pounds in range and returns minor units", () => {
    expect(parseBudgetGbp("50")).toBe(5000);
    expect(parseBudgetGbp("10000")).toBe(1_000_000);
    expect(parseBudgetGbp(" 500 ")).toBe(50_000);
  });

  it("rejects out-of-range, non-integer, and non-numeric values", () => {
    expect(parseBudgetGbp("49")).toBeNull();
    expect(parseBudgetGbp("10001")).toBeNull();
    expect(parseBudgetGbp("50.5")).toBeNull();
    expect(parseBudgetGbp("free")).toBeNull();
    expect(parseBudgetGbp("")).toBeNull();
  });
});
