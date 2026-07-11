import { randomUUID } from "node:crypto";
import { brandProfilesRepository, campaignsRepository, getDb, resetDbForTests } from "@jj/db";
import { SCHEMA_VERSION, type BrandProfile, type Campaign } from "@jj/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const now = "2026-07-11T00:00:00.000Z";

function brand(uid: string): BrandProfile {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    uid,
    locale: "en",
    companyName: "Acme",
    about: "We make things",
  };
}

function campaign(id: string, brandUid: string): Campaign {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id,
    brandUid,
    locale: "en",
    title: "Summer",
    brief: "UGC",
    budgetMinor: 500000,
    status: "draft",
  };
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("requires FIRESTORE_EMULATOR_HOST");
});
afterAll(() => resetDbForTests());

describe("brand + campaigns (emulator)", () => {
  const brands = brandProfilesRepository(getDb());
  const campaigns = campaignsRepository(getDb());

  it("upserts and reads a brand profile", async () => {
    const uid = `b-${randomUUID()}`;
    await brands.upsert(brand(uid));
    expect((await brands.get(uid))?.companyName).toBe("Acme");
  });

  it("creates, lists by brand, and publishes a campaign", async () => {
    const brandUid = `b-${randomUUID()}`;
    const id = `c-${randomUUID()}`;
    await campaigns.create(campaign(id, brandUid));
    const list = await campaigns.listByBrand(brandUid);
    expect(list.map((c) => c.id)).toContain(id);
    await campaigns.setStatus(id, "published", now);
    expect((await campaigns.get(id))?.status).toBe("published");
  });
});
