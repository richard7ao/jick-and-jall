import { createHmac } from "node:crypto";
import { SCHEMA_VERSION, type Deal } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { buildCheckoutParams, reconcile, verifyStripeSignature } from "@jj/payments";

const now = "2026-07-11T00:00:00.000Z";
const deal: Deal = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  id: "d1",
  offerId: "o1",
  offerVersion: 2,
  status: "mutually_accepted",
  creatorUid: "cr1",
  brandUid: "b1",
  creatorAmountMinor: 10000,
  platformFeeMinor: 1000,
  brandChargeMinor: 11000,
};

describe("checkout", () => {
  it("charges amount + 10% fee with a deal-versioned idempotency key", () => {
    const params = buildCheckoutParams(deal);
    expect(params.amountMinor).toBe(11000);
    expect(params.currency).toBe("gbp");
    expect(params.idempotencyKey).toBe("deal_d1_v2");
  });
});

describe("webhook signature", () => {
  const secret = "whsec_test";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });

  function sign(ts: number): string {
    const sig = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
    return `t=${ts},v1=${sig}`;
  }

  it("accepts a valid, in-tolerance signature", () => {
    const ts = 1_000_000;
    expect(verifyStripeSignature(payload, sign(ts), secret, 300, ts)).toBe(true);
  });

  it("rejects tampered payloads, bad secrets, and stale timestamps", () => {
    const ts = 1_000_000;
    expect(verifyStripeSignature(payload + "x", sign(ts), secret, 300, ts)).toBe(false);
    expect(verifyStripeSignature(payload, sign(ts), "wrong", 300, ts)).toBe(false);
    expect(verifyStripeSignature(payload, sign(ts), secret, 300, ts + 10_000)).toBe(false);
  });
});

describe("ledger reconciliation", () => {
  it("nets charges minus payout intents in integer minor units", () => {
    const r = reconcile([
      { dealId: "d1", kind: "charge", amountMinor: 11000 },
      { dealId: "d1", kind: "payout_intent", amountMinor: 10000 },
    ]);
    expect(r).toEqual({ chargedMinor: 11000, payoutIntentMinor: 10000, platformNetMinor: 1000 });
  });

  it("rejects non-integer amounts", () => {
    expect(() => reconcile([{ dealId: "d", kind: "charge", amountMinor: 1.5 }])).toThrow();
  });
});
