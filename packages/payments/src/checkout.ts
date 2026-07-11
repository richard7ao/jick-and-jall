import { computeBrandCharge, type Deal } from "@jj/shared";

/**
 * Build test-mode Checkout parameters for funding a deal. The brand is charged
 * the creator amount plus the 10% platform fee, in GBP integer minor units. No
 * live payout is executed here — funding only.
 */
export type CheckoutParams = {
  readonly currency: "gbp";
  readonly amountMinor: number;
  readonly dealId: string;
  readonly idempotencyKey: string;
  readonly metadata: Readonly<Record<string, string>>;
};

export function buildCheckoutParams(deal: Deal): CheckoutParams {
  const charge = computeBrandCharge(deal.creatorAmountMinor);
  return {
    currency: "gbp",
    amountMinor: charge.brandChargeMinor,
    dealId: deal.id,
    // Idempotent per deal + terms version so retries never double-charge.
    idempotencyKey: `deal_${deal.id}_v${deal.offerVersion}`,
    metadata: {
      dealId: deal.id,
      creatorAmountMinor: String(charge.creatorAmountMinor),
      platformFeeMinor: String(charge.platformFeeMinor),
    },
  };
}
