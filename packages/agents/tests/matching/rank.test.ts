import { describe, expect, it } from "vitest";
import { cosineSimilarity, isEligible, rankCandidates, type RankCandidate } from "@jj/agents";

const base = { published: true, available: true } as const;

function cand(uid: string, embedding: number[], extra: Partial<RankCandidate> = {}): RankCandidate {
  return { creatorUid: uid, ...base, embedding, ...extra };
}

describe("eligibility", () => {
  it("excludes unpublished, unavailable, and over-budget creators", () => {
    expect(isEligible(cand("a", [1]), 1000)).toBe(true);
    expect(isEligible(cand("a", [1], { published: false }), 1000)).toBe(false);
    expect(isEligible(cand("a", [1], { available: false }), 1000)).toBe(false);
    expect(isEligible(cand("a", [1], { minBudgetMinor: 2000 }), 1000)).toBe(false);
  });
});

describe("rankCandidates", () => {
  const campaignEmbedding = [1, 0, 0];

  it("ranks by semantic similarity and only includes eligible creators", () => {
    const ranked = rankCandidates({
      campaignEmbedding,
      budgetMinor: 100000,
      candidates: [
        cand("far", [0, 1, 0]),
        cand("near", [1, 0, 0]),
        cand("hidden", [1, 0, 0], { published: false }),
      ],
    });
    expect(ranked.map((r) => r.creatorUid)).toEqual(["near", "far"]);
    expect(ranked[0]!.score).toBeGreaterThan(ranked[1]!.score);
  });

  it("is deterministic and stable (tie-broken by uid)", () => {
    const input = { campaignEmbedding, budgetMinor: 100000, candidates: [cand("b", [1, 0, 0]), cand("a", [1, 0, 0])] };
    expect(rankCandidates(input).map((r) => r.creatorUid)).toEqual(["a", "b"]);
  });

  it("produces scores within [0,1]", () => {
    const ranked = rankCandidates({ campaignEmbedding, budgetMinor: 1, candidates: [cand("a", [-1, 0, 0])] });
    expect(ranked[0]!.score).toBeGreaterThanOrEqual(0);
    expect(ranked[0]!.score).toBeLessThanOrEqual(1);
  });

  it("cosineSimilarity handles zero vectors", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
