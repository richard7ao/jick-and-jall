import { SCHEMA_VERSION, type Deal } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { applyDeliveryAction, executePayout, executeRefund, executeReversal, PaymentOperationDisabled } from "@jj/agents";

const now = "2026-07-11T00:00:00.000Z";
function deal(status: Deal["status"]): Deal {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id: "d1",
    offerId: "o1",
    offerVersion: 1,
    status,
    creatorUid: "cr1",
    brandUid: "b1",
    creatorAmountMinor: 10000,
    platformFeeMinor: 1000,
    brandChargeMinor: 11000,
  };
}

describe("delivery actions", () => {
  it("delivers funded work and approves delivered work", () => {
    expect(applyDeliveryAction(deal("funded"), "deliver", now).status).toBe("delivered");
    expect(applyDeliveryAction(deal("delivered"), "approve", now).status).toBe("approved");
    expect(applyDeliveryAction(deal("delivered"), "requestRevision", now).status).toBe("revision_requested");
  });

  it("rejects an illegal delivery action", () => {
    expect(() => applyDeliveryAction(deal("funded"), "approve", now)).toThrow();
  });
});

describe("disabled money operations (v1 gate)", () => {
  it("throws for payout, refund, and reversal", () => {
    expect(() => executePayout()).toThrow(PaymentOperationDisabled);
    expect(() => executeRefund()).toThrow(PaymentOperationDisabled);
    expect(() => executeReversal()).toThrow(PaymentOperationDisabled);
  });
});
