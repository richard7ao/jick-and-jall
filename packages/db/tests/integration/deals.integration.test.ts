import { randomUUID } from "node:crypto";
import { dealsRepository, getDb, offersRepository, resetDbForTests } from "@jj/db";
import { buildDealFromOffer } from "@jj/agents";
import { SCHEMA_VERSION, type Offer } from "@jj/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const now = "2026-07-11T00:00:00.000Z";

function offer(): Offer {
  const campaignId = `camp-${randomUUID()}`;
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id: `${campaignId}__cr1__v1`,
    version: 1,
    campaignId,
    creatorUid: "cr1",
    brandUid: "b1",
    creatorAmountMinor: 10000,
    deliverable: "1 reel",
  };
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("requires FIRESTORE_EMULATOR_HOST");
});
afterAll(() => resetDbForTests());

describe("offers + deals (emulator)", () => {
  const offers = offersRepository(getDb());
  const deals = dealsRepository(getDb());

  it("stores versioned offers and returns the latest", async () => {
    const o1 = offer();
    await offers.create(o1);
    await offers.create({ ...o1, id: `${o1.campaignId}__cr1__v2`, version: 2, creatorAmountMinor: 12000 });
    const latest = await offers.latest(o1.campaignId, "cr1");
    expect(latest?.version).toBe(2);
  });

  it("applies legal transitions and rejects illegal ones", async () => {
    const o = offer();
    const deal = buildDealFromOffer(o, `d-${randomUUID()}`, now);
    await deals.create(deal);
    await deals.transition(deal.id, "funded", now);
    expect((await deals.get(deal.id))?.status).toBe("funded");
    await expect(deals.transition(deal.id, "complete", now)).rejects.toThrow();
  });
});
