import { describe, expect, it } from "vitest";

import { computeBrandCharge, type Consent } from "@jj/shared";

import { createRepositories, InMemoryStore } from "../src/index.js";
import type { Clock } from "../src/ids.js";

const consent: Consent = { accepted: true, policyVersion: "2026-07-11" };
const fixedClock: Clock = { now: () => "2026-07-11T00:00:00.000Z" };

function repos(clock: Clock = fixedClock) {
  return createRepositories(new InMemoryStore(), clock);
}

describe("waitlist repository", () => {
  it("stores a pending entry and finds it by email", async () => {
    const r = repos();
    const entry = await r.waitlist.add({
      role: "creator",
      email: "a@b.co",
      locale: "en",
      consent,
    });
    expect(entry.status).toBe("pending");
    expect((await r.waitlist.getByEmail("a@b.co"))?.id).toBe(entry.id);
  });
});

describe("users repository", () => {
  it("treats role as immutable", async () => {
    const r = repos();
    await r.users.create({ uid: "u1", email: "u@b.co", role: "creator", locale: "en" });
    await expect(
      r.users.create({ uid: "u1", email: "u@b.co", role: "brand", locale: "en" }),
    ).rejects.toThrow(/immutable/);
  });
});

describe("offers repository", () => {
  it("appends monotonically increasing versions", async () => {
    const r = repos();
    const base = {
      campaignId: "c1",
      creatorUid: "cr1",
      brandUid: "br1",
      deliverable: "One reel",
    };
    const v1 = await r.offers.appendVersion({ ...base, creatorAmountMinor: 50000 });
    const v2 = await r.offers.appendVersion({ ...base, creatorAmountMinor: 60000 });
    expect([v1.version, v2.version]).toEqual([1, 2]);
    expect((await r.offers.latestFor("c1", "cr1"))?.creatorAmountMinor).toBe(60000);
  });
});

describe("deals repository", () => {
  it("computes the brand charge and guards illegal transitions", async () => {
    const r = repos();
    const offer = await r.offers.appendVersion({
      campaignId: "c1",
      creatorUid: "cr1",
      brandUid: "br1",
      deliverable: "Reel",
      creatorAmountMinor: 50000,
    });
    const deal = await r.deals.createFromOffer(offer);
    expect(deal.brandChargeMinor).toBe(computeBrandCharge(50000).brandChargeMinor);
    await r.deals.transition(deal.id, "funded");
    await expect(r.deals.transition(deal.id, "paid")).rejects.toThrow(/illegal/);
  });
});

describe("voice sessions repository", () => {
  it("purges sessions past their retention window, keeping newer ones", async () => {
    const r = repos();
    const s = await r.voiceSessions.create({
      uid: "u1",
      locale: "en",
      consentVersion: "2026-07-11",
    });
    const within = Date.parse("2026-08-01T00:00:00.000Z");
    expect(await r.voiceSessions.purgeExpired(within)).toEqual([]);
    const past = Date.parse("2026-11-01T00:00:00.000Z");
    expect(await r.voiceSessions.purgeExpired(past)).toEqual([s.id]);
    expect(await r.voiceSessions.getById(s.id)).toBeNull();
  });
});

describe("matches repository", () => {
  it("hides disclosure until consent is recorded", async () => {
    const r = repos();
    const m = await r.matches.create({
      campaignId: "c1",
      creatorUid: "cr1",
      brandUid: "br1",
      score: 0.9,
    });
    expect(m.disclosureConsented).toBe(false);
    await r.matches.setConsent(m.id, true);
    expect((await r.matches.getById(m.id))?.disclosureConsented).toBe(true);
  });
});

describe("creator profiles repository", () => {
  it("ranks only published and available creators", async () => {
    const r = repos();
    await r.creatorProfiles.upsert({
      uid: "cr1", locale: "en", displayName: "A", bio: "", niches: [], platforms: [],
      published: true, available: true,
    });
    await r.creatorProfiles.upsert({
      uid: "cr2", locale: "en", displayName: "B", bio: "", niches: [], platforms: [],
      published: true, available: false,
    });
    const rankable = await r.creatorProfiles.listRankable();
    expect(rankable.map((c) => c.uid)).toEqual(["cr1"]);
  });
});
