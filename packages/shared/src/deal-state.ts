import { z } from "zod";

/**
 * The deal lifecycle is a TypeScript-owned state machine. Model output never
 * decides a transition; only `canTransitionDeal` does. Live payout, refund,
 * reversal, and dispute resolution remain disabled at the operation layer even
 * though the graph below describes their eventual legal transitions.
 */

export const DealStatusSchema = z.enum([
  "draft",
  "offered",
  "accepted_by_one_party",
  "mutually_accepted",
  "funded",
  "delivered",
  "revision_requested",
  "approved",
  "payout_pending",
  "paid",
  "complete",
  "cancelled",
  "disputed",
]);
export type DealStatus = z.infer<typeof DealStatusSchema>;

/** Adjacency list of legal transitions. Empty array means terminal. */
const LEGAL_TRANSITIONS: Readonly<Record<DealStatus, readonly DealStatus[]>> = {
  draft: ["offered", "cancelled"],
  offered: ["accepted_by_one_party", "cancelled"],
  accepted_by_one_party: ["mutually_accepted", "cancelled"],
  mutually_accepted: ["funded", "cancelled"],
  funded: ["delivered", "disputed", "cancelled"],
  delivered: ["revision_requested", "approved", "disputed"],
  revision_requested: ["delivered", "disputed", "cancelled"],
  approved: ["payout_pending", "disputed"],
  payout_pending: ["paid", "disputed"],
  paid: ["complete", "disputed"],
  complete: [],
  cancelled: [],
  disputed: ["approved", "cancelled"],
};

export function canTransitionDeal(from: DealStatus, to: DealStatus): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

export function nextDealStatuses(from: DealStatus): readonly DealStatus[] {
  return LEGAL_TRANSITIONS[from];
}

export function isTerminalDealStatus(status: DealStatus): boolean {
  return LEGAL_TRANSITIONS[status].length === 0;
}
