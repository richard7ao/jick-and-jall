// @vitest-environment node
import type { Principal } from "@jj/auth";
import type { Campaign } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleCreateCampaign, handleListCampaigns, type CampaignDeps } from "../../../app/api/jall/campaigns/route";

const brand: Principal = { uid: "b1", role: "brand" };
const now = "2026-07-11T00:00:00.000Z";

function makeDeps(principal: Principal | null) {
  const store: Campaign[] = [];
  const deps: CampaignDeps = {
    getPrincipal: () => principal,
    create: async (c) => {
      store.push(c);
      return c;
    },
    listByBrand: async (uid) => store.filter((c) => c.brandUid === uid),
    now: () => now,
    newId: () => "camp-1",
  };
  return { deps, store };
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/jall/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Jall campaigns API", () => {
  it("forbids non-brands", async () => {
    expect((await handleCreateCampaign(post({}), makeDeps({ uid: "c", role: "creator" }).deps)).status).toBe(403);
  });

  it("creates a draft campaign with server-owned id/brandUid", async () => {
    const { deps, store } = makeDeps(brand);
    const res = await handleCreateCampaign(post({ locale: "en", title: "Summer", brief: "UGC", budgetMinor: 500000 }), deps);
    expect(res.status).toBe(201);
    expect(store[0]?.brandUid).toBe("b1");
    expect(store[0]?.status).toBe("draft");
  });

  it("lists only the brand's own campaigns", async () => {
    const { deps } = makeDeps(brand);
    await handleCreateCampaign(post({ locale: "en", title: "Summer", brief: "UGC", budgetMinor: 500000 }), deps);
    const res = await handleListCampaigns(new Request("http://x"), deps);
    expect((await res.json()).campaigns).toHaveLength(1);
  });

  it("rejects an invalid campaign (non-integer budget)", async () => {
    const { deps } = makeDeps(brand);
    expect((await handleCreateCampaign(post({ locale: "en", title: "x", budgetMinor: 1.5 }), deps)).status).toBe(400);
  });
});
