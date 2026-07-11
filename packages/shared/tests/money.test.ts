import { describe, expect, it } from "vitest";
import { computeBrandCharge, platformFeeMinor } from "@jj/shared";

describe("platform fee and brand charge", () => {
  it("charges creator amount plus a 10% fee in integer minor units", () => {
    expect(computeBrandCharge(10_000)).toEqual({
      creatorAmountMinor: 10_000,
      platformFeeMinor: 1_000,
      brandChargeMinor: 11_000,
    });
  });

  it("rounds the fee to the nearest penny (half up)", () => {
    // 1999 * 10% = 199.9 -> 200
    expect(platformFeeMinor(1_999)).toBe(200);
    // 1994 * 10% = 199.4 -> 199
    expect(platformFeeMinor(1_994)).toBe(199);
  });

  it("keeps everything integer and never negative", () => {
    const charge = computeBrandCharge(1_999);
    expect(Number.isInteger(charge.brandChargeMinor)).toBe(true);
    expect(charge.brandChargeMinor).toBe(1_999 + 200);
  });

  it("rejects negative or fractional creator amounts", () => {
    expect(() => computeBrandCharge(-1)).toThrow();
    expect(() => computeBrandCharge(10.5)).toThrow();
  });
});
