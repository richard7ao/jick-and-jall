import type { Principal } from "@jj/auth";
import { rankCandidates, type RankCandidate } from "@jj/agents";
import { SCHEMA_VERSION, type Campaign, type Match } from "@jj/shared";
import type { NextRequest } from "next/server";

/**
 * Matching API. Ranking is deterministic (TypeScript-owned). A brand computes
 * matches for its own campaign; a creator consents to disclosure of their own
 * match. Contact details stay hidden until the creator consents.
 */
export const runtime = "nodejs";

export type MatchDeps = {
  getPrincipal: (request: Request) => Principal | null;
  getCampaign: (id: string) => Promise<Campaign | null>;
  campaignEmbedding: (campaign: Campaign) => Promise<number[]>;
  listCandidates: () => Promise<RankCandidate[]>;
  upsertMatch: (match: Match) => Promise<Match>;
  getMatch: (id: string) => Promise<Match | null>;
  setConsent: (id: string, consented: boolean, at: string) => Promise<void>;
  now: () => string;
  matchId: (campaignId: string, creatorUid: string) => string;
  topN?: number;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function handleComputeMatches(request: Request, deps: MatchDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal || principal.role !== "brand") return json(403, { error: "forbidden" });

  let body: { campaignId?: string };
  try {
    body = (await request.json()) as { campaignId?: string };
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body.campaignId) return json(400, { error: "invalid_input" });

  const campaign = await deps.getCampaign(body.campaignId);
  if (!campaign) return json(404, { error: "not_found" });
  if (campaign.brandUid !== principal.uid) return json(403, { error: "forbidden" });

  const embedding = await deps.campaignEmbedding(campaign);
  const ranked = rankCandidates({
    campaignEmbedding: embedding,
    budgetMinor: campaign.budgetMinor,
    candidates: await deps.listCandidates(),
  }).slice(0, deps.topN ?? 20);

  const now = deps.now();
  const matches: Match[] = [];
  for (const r of ranked) {
    matches.push(
      await deps.upsertMatch({
        schemaVersion: SCHEMA_VERSION,
        createdAt: now,
        updatedAt: now,
        id: deps.matchId(campaign.id, r.creatorUid),
        campaignId: campaign.id,
        creatorUid: r.creatorUid,
        brandUid: campaign.brandUid,
        score: r.score,
        disclosureConsented: false,
      }),
    );
  }
  // Matches expose only uid + score; contact details require creator consent.
  return json(200, { matches: matches.map((m) => ({ id: m.id, creatorUid: m.creatorUid, score: m.score })) });
}

export async function handleConsent(request: Request, deps: MatchDeps): Promise<Response> {
  const principal = deps.getPrincipal(request);
  if (!principal || principal.role !== "creator") return json(403, { error: "forbidden" });

  let body: { matchId?: string };
  try {
    body = (await request.json()) as { matchId?: string };
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (!body.matchId) return json(400, { error: "invalid_input" });

  const match = await deps.getMatch(body.matchId);
  if (!match) return json(404, { error: "not_found" });
  if (match.creatorUid !== principal.uid) return json(403, { error: "forbidden" });

  await deps.setConsent(match.id, true, deps.now());
  return json(200, { consented: true });
}

export async function POST(_request: NextRequest): Promise<Response> {
  return json(501, { error: "not_implemented" });
}
