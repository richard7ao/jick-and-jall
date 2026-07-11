import { describe, expect, it } from "vitest";

import {
  isBudgetCompatible,
  nicheOverlapScore,
  rankCandidates,
  scoreCandidate,
  type CandidateSignal,
} from "../src/index.js";

const brief = { niches: ["cooking", "food"], budgetMinor: 100000 };

function candidate(over: Partial<CandidateSignal> & { creatorUid: string }): CandidateSignal {
  return {
    semanticScore: 0.5,
    niches: [],
    rankable: true,
    ...over,
  };
}

describe("nicheOverlapScore", () => {
  it("is Jaccard overlap, case-insensitive", () => {
    expect(nicheOverlapScore(["Cooking"], ["cooking"])).toBe(1);
    expect(nicheOverlapScore(["a", "b"], ["b", "c"])).toBeCloseTo(1 / 3);
    expect(nicheOverlapScore([], ["x"])).toBe(0);
  });
});

describe("isBudgetCompatible", () => {
  it("passes only when the brief meets the creator's minimum", () => {
    expect(isBudgetCompatible(brief, candidate({ creatorUid: "a", minBudgetMinor: 50000 }))).toBe(true);
    expect(isBudgetCompatible(brief, candidate({ creatorUid: "a", minBudgetMinor: 200000 }))).toBe(false);
    expect(isBudgetCompatible(brief, candidate({ creatorUid: "a" }))).toBe(true);
  });
});

describe("scoreCandidate", () => {
  it("blends semantic and niche overlap into [0,1]", () => {
    const s = scoreCandidate(brief, candidate({ creatorUid: "a", semanticScore: 1, niches: ["cooking", "food"] }));
    expect(s).toBeCloseTo(1);
    const low = scoreCandidate(brief, candidate({ creatorUid: "a", semanticScore: 0, niches: [] }));
    expect(low).toBe(0);
  });

  it("clamps out-of-range semantic scores", () => {
    expect(scoreCandidate(brief, candidate({ creatorUid: "a", semanticScore: 5, niches: brief.niches }))).toBeLessThanOrEqual(1);
  });
});

describe("rankCandidates", () => {
  it("filters ineligible/over-budget and ranks highest-first with stable ties", () => {
    const ranked = rankCandidates(brief, [
      candidate({ creatorUid: "over", minBudgetMinor: 999999, semanticScore: 1, niches: brief.niches }),
      candidate({ creatorUid: "unpublished", rankable: false, semanticScore: 1 }),
      candidate({ creatorUid: "bbb", semanticScore: 0.5, niches: brief.niches }),
      candidate({ creatorUid: "aaa", semanticScore: 0.5, niches: brief.niches }),
      candidate({ creatorUid: "top", semanticScore: 1, niches: brief.niches }),
    ]);
    expect(ranked.map((r) => r.creatorUid)).toEqual(["top", "aaa", "bbb"]);
    expect(ranked.every((r) => r.score >= 0 && r.score <= 1)).toBe(true);
  });
});
