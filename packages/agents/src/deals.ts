import { canTransitionDeal, computeBrandCharge, SCHEMA_VERSION, type Deal, type DealStatus, type Offer } from "@jj/shared";

/**
 * Deal helpers. Money is derived deterministically (creator amount + 10% fee),
 * and status changes go through the TypeScript-owned state machine. Illegal
 * transitions throw rather than silently applying.
 */
export function buildDealFromOffer(offer: Offer, id: string, now: string): Deal {
  const charge = computeBrandCharge(offer.creatorAmountMinor);
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id,
    offerId: offer.id,
    offerVersion: offer.version,
    status: "mutually_accepted",
    creatorUid: offer.creatorUid,
    brandUid: offer.brandUid,
    creatorAmountMinor: charge.creatorAmountMinor,
    platformFeeMinor: charge.platformFeeMinor,
    brandChargeMinor: charge.brandChargeMinor,
  };
}

export class IllegalDealTransition extends Error {
  constructor(from: DealStatus, to: DealStatus) {
    super(`illegal deal transition: ${from} -> ${to}`);
    this.name = "IllegalDealTransition";
  }
}

export function applyDealTransition(deal: Deal, to: DealStatus, now: string): Deal {
  if (!canTransitionDeal(deal.status, to)) throw new IllegalDealTransition(deal.status, to);
  return { ...deal, status: to, updatedAt: now };
}
