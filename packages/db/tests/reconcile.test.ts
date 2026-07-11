import { describe, expect, it } from "vitest";

import { createRepositories, InMemoryStore, markDealFunded } from "../src/index.js";
import type { Clock } from "../src/ids.js";

const clock: Clock = { now: () => "2026-07-11T00:00:00.000Z" };

async function seedDeal() {
  const repos = createRepositories(new InMemoryStore(), clock);
  const offer = await repos.offers.appendVersion({
    campaignId: "c1",
    creatorUid: "cr1",
    brandUid: "br1",
    deliverable: "Reel",
    creatorAmountMinor: 50000,
  });
  const deal = await repos.deals.createFromOffer(offer);
  return { repos, deal };
}

describe("markDealFunded", () => {
  it("funds a deal once and records a charge in the ledger", async () => {
    const { repos, deal } = await seedDeal();
    expect(await markDealFunded(repos, deal.id, "cs_test_1")).toBe("funded");
    expect((await repos.deals.getById(deal.id))?.status).toBe("funded");
    const ledger = await repos.ledger.listByDeal(deal.id);
    expect(ledger).toHaveLength(1);
    expect(ledger[0]?.kind).toBe("charge");
    expect(ledger[0]?.amountMinor).toBe(deal.brandChargeMinor);
  });

  it("is idempotent for a duplicate webhook reference", async () => {
    const { repos, deal } = await seedDeal();
    await markDealFunded(repos, deal.id, "cs_test_1");
    expect(await markDealFunded(repos, deal.id, "cs_test_1")).toBe("duplicate");
    expect(await repos.ledger.listByDeal(deal.id)).toHaveLength(1);
  });

  it("reports unknown deals without side effects", async () => {
    const { repos } = await seedDeal();
    expect(await markDealFunded(repos, "missing", "cs_x")).toBe("unknown_deal");
  });
});
