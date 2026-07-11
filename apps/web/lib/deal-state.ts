/**
 * Client-side mirror of the deal lifecycle. Authoritative transitions live on
 * the server; this module is deterministic TypeScript used only to render the
 * right controls and to compute charges — never to authorize money movement.
 */

export type DealStatus =
  | "draft"
  | "offered"
  | "accepted_by_one_party"
  | "mutually_accepted"
  | "funded"
  | "delivered"
  | "revision_requested"
  | "approved"
  | "payout_pending"
  | "paid"
  | "complete"
  | "cancelled"
  | "disputed";

const TRANSITIONS: Record<DealStatus, readonly DealStatus[]> = {
  draft: ["offered", "cancelled"],
  offered: ["accepted_by_one_party", "cancelled"],
  accepted_by_one_party: ["mutually_accepted", "cancelled"],
  mutually_accepted: ["funded", "cancelled"],
  funded: ["delivered", "disputed"],
  delivered: ["revision_requested", "approved", "disputed"],
  revision_requested: ["delivered", "disputed"],
  approved: ["payout_pending"],
  payout_pending: ["paid"],
  paid: ["complete"],
  complete: [],
  cancelled: [],
  disputed: ["approved", "cancelled"],
};

export function canTransition(from: DealStatus, to: DealStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(status: DealStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** All amounts are GBP integer minor units. The brand pays creator + 10%. */
export const PLATFORM_FEE_BPS = 1000;

export function platformFeeMinor(creatorMinor: number): number {
  return Math.round((creatorMinor * PLATFORM_FEE_BPS) / 10_000);
}

export function brandChargeMinor(creatorMinor: number): number {
  return creatorMinor + platformFeeMinor(creatorMinor);
}

export function formatGbp(minor: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(minor / 100);
}
