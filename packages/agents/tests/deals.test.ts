import { SCHEMA_VERSION, type Offer } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { applyDealTransition, buildDealFromOffer, IllegalDealTransition } from "@jj/agents";

const now = "2026-07-11T00:00:00.000Z";
const offer: Offer = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  id: "o1",
  version: 2,
  campaignId: "camp-1",
  creatorUid: "cr1",
  brandUid: "b1",
  creatorAmountMinor: 10000,
  deliverable: "1 reel",
};

describe("buildDealFromOffer", () => {
  it("derives the money breakdown and starts mutually_accepted", () => {
    const deal = buildDealFromOffer(offer, "d1", now);
    expect(deal.status).toBe("mutually_accepted");
    expect(deal.offerVersion).toBe(2);
    expect(deal).toMatchObject({ creatorAmountMinor: 10000, platformFeeMinor: 1000, brandChargeMinor: 11000 });
  });
});

describe("applyDealTransition", () => {
  it("applies a legal transition", () => {
    const deal = buildDealFromOffer(offer, "d1", now);
    expect(applyDealTransition(deal, "funded", now).status).toBe("funded");
  });

  it("throws on an illegal transition", () => {
    const deal = buildDealFromOffer(offer, "d1", now);
    expect(() => applyDealTransition(deal, "paid", now)).toThrow(IllegalDealTransition);
  });
});
