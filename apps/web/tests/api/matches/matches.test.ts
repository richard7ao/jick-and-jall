// @vitest-environment node
import type { Principal } from "@jj/auth";
import { SCHEMA_VERSION, type Campaign, type Match } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleComputeMatches, handleConsent, type MatchDeps } from "../../../app/api/matches/route";

const brand: Principal = { uid: "b1", role: "brand" };
const creator: Principal = { uid: "cr1", role: "creator" };
const now = "2026-07-11T00:00:00.000Z";

const campaign: Campaign = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  id: "camp-1",
  brandUid: "b1",
  locale: "en",
  title: "Summer",
  brief: "UGC",
  budgetMinor: 500000,
  status: "published",
};

function makeDeps(principal: Principal | null, overrides: Partial<MatchDeps> = {}) {
  const saved: Match[] = [];
  const deps: MatchDeps = {
    getPrincipal: () => principal,
    getCampaign: async (id) => (id === campaign.id ? campaign : null),
    campaignEmbedding: async () => [1, 0, 0],
    listCandidates: async () => [
      { creatorUid: "cr1", published: true, available: true, embedding: [1, 0, 0] },
      { creatorUid: "cr2", published: false, available: true, embedding: [1, 0, 0] },
    ],
    upsertMatch: async (m) => {
      saved.push(m);
      return m;
    },
    getMatch: async (id) => saved.find((m) => m.id === id) ?? null,
    setConsent: async (id, consented) => {
      const m = saved.find((x) => x.id === id);
      if (m) (m as { disclosureConsented: boolean }).disclosureConsented = consented;
    },
    now: () => now,
    matchId: (c, u) => `${c}:${u}`,
    ...overrides,
  };
  return { deps, saved };
}

function post(url: string, body: unknown): Request {
  return new Request(`http://localhost/api/${url}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("compute matches", () => {
  it("ranks eligible creators only and hides contact details", async () => {
    const { deps, saved } = makeDeps(brand);
    const res = await handleComputeMatches(post("matches", { campaignId: "camp-1" }), deps);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.matches.map((m: { creatorUid: string }) => m.creatorUid)).toEqual(["cr1"]); // cr2 unpublished
    expect(Object.keys(body.matches[0])).toEqual(["id", "creatorUid", "score"]); // no contact/email
    expect(saved[0]?.disclosureConsented).toBe(false);
  });

  it("forbids non-brands and other brands' campaigns", async () => {
    expect((await handleComputeMatches(post("matches", { campaignId: "camp-1" }), makeDeps(creator).deps)).status).toBe(403);
    const otherBrand = makeDeps({ uid: "b2", role: "brand" });
    expect((await handleComputeMatches(post("matches", { campaignId: "camp-1" }), otherBrand.deps)).status).toBe(403);
  });
});

describe("consent", () => {
  it("lets only the matched creator consent to disclosure", async () => {
    const { deps, saved } = makeDeps(brand);
    await handleComputeMatches(post("matches", { campaignId: "camp-1" }), deps);
    const matchId = saved[0]!.id;

    const creatorDeps = makeDeps(creator, {
      getMatch: async () => saved[0]!,
      setConsent: async (_id, c) => {
        (saved[0] as { disclosureConsented: boolean }).disclosureConsented = c;
      },
    }).deps;
    const res = await handleConsent(post("matches/consent", { matchId }), creatorDeps);
    expect(res.status).toBe(200);
    expect(saved[0]?.disclosureConsented).toBe(true);

    const wrong = makeDeps({ uid: "crX", role: "creator" }, { getMatch: async () => saved[0]! }).deps;
    expect((await handleConsent(post("matches/consent", { matchId }), wrong)).status).toBe(403);
  });
});
