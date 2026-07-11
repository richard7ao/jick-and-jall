import { MoneyMinorSchema } from "./common.js";

/**
 * Deterministic money math for the marketplace. The brand pays the creator
 * amount plus a 10% platform fee; everything is GBP integer minor units so
 * reconciliation is exact. There is no floating point in stored values.
 */

export const PLATFORM_FEE_BASIS_POINTS = 1000; // 10.00%
const BASIS_POINT_DENOMINATOR = 10_000;

/** Platform fee (rounded to the nearest penny, half up). */
export function platformFeeMinor(creatorAmountMinor: number): number {
  const amount = MoneyMinorSchema.parse(creatorAmountMinor);
  return Math.round((amount * PLATFORM_FEE_BASIS_POINTS) / BASIS_POINT_DENOMINATOR);
}

export type BrandCharge = {
  readonly creatorAmountMinor: number;
  readonly platformFeeMinor: number;
  readonly brandChargeMinor: number;
};

/** Full breakdown of what the brand is charged for a given creator payout. */
export function computeBrandCharge(creatorAmountMinor: number): BrandCharge {
  const amount = MoneyMinorSchema.parse(creatorAmountMinor);
  const fee = platformFeeMinor(amount);
  return {
    creatorAmountMinor: amount,
    platformFeeMinor: fee,
    brandChargeMinor: amount + fee,
  };
}
