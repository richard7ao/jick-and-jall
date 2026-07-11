import type { Deal, DealStatus } from "@jj/shared";
import { applyDealTransition } from "./deals.js";

/**
 * Delivery and controlled intervention. Ordinary lifecycle transitions go
 * through the state machine. Money-moving operations (payout, refund, reversal)
 * are DISABLED in v1: they throw until the separate live-payment human gate is
 * approved, so no funds move automatically.
 */
export class PaymentOperationDisabled extends Error {
  constructor(operation: string) {
    super(`payment operation disabled in v1: ${operation}`);
    this.name = "PaymentOperationDisabled";
  }
}

const DELIVERY_ACTIONS = {
  deliver: "delivered",
  requestRevision: "revision_requested",
  approve: "approved",
  dispute: "disputed",
  cancel: "cancelled",
} as const;

export type DeliveryAction = keyof typeof DELIVERY_ACTIONS;

export function applyDeliveryAction(deal: Deal, action: DeliveryAction, now: string): Deal {
  const to: DealStatus = DELIVERY_ACTIONS[action];
  return applyDealTransition(deal, to, now); // throws on illegal transition
}

/** v1 gate: automatic payout is not executed. */
export function executePayout(): never {
  throw new PaymentOperationDisabled("payout");
}
export function executeRefund(): never {
  throw new PaymentOperationDisabled("refund");
}
export function executeReversal(): never {
  throw new PaymentOperationDisabled("reversal");
}
