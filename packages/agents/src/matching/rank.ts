/**
 * Deterministic creator ranking. TypeScript — not the model — owns the ranking:
 * Superlinked (or any provider) supplies a semantic similarity signal in [0,1],
 * and this module blends it with rule-based fit and hard eligibility filters.
 * The same inputs always produce the same ordering.
 */

export interface BriefSignal {
  niches: readonly string[];
  budgetMinor: number;
}

export interface CandidateSignal {
  creatorUid: string;
  /** Semantic similarity from the provider, clamped to [0,1]. */
  semanticScore: number;
  niches: readonly string[];
  /** Minimum the creator will accept; undefined means no floor. */
  minBudgetMinor?: number;
  /** Only registered + published + available creators should be passed in. */
  rankable: boolean;
}

export interface RankWeights {
  semantic: number;
  nicheOverlap: number;
}

export const DEFAULT_WEIGHTS: RankWeights = { semantic: 0.7, nicheOverlap: 0.3 };

export interface RankedMatch {
  creatorUid: string;
  score: number;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Jaccard overlap of niche sets, in [0,1]. Empty-vs-empty is 0 (no signal). */
export function nicheOverlapScore(
  brief: readonly string[],
  candidate: readonly string[],
): number {
  const a = new Set(brief.map((n) => n.toLowerCase()));
  const b = new Set(candidate.map((n) => n.toLowerCase()));
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const n of a) if (b.has(n)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

/** A candidate is budget-compatible when the brief meets their minimum. */
export function isBudgetCompatible(
  brief: BriefSignal,
  candidate: CandidateSignal,
): boolean {
  return (candidate.minBudgetMinor ?? 0) <= brief.budgetMinor;
}

export function scoreCandidate(
  brief: BriefSignal,
  candidate: CandidateSignal,
  weights: RankWeights = DEFAULT_WEIGHTS,
): number {
  const semantic = clamp01(candidate.semanticScore);
  const overlap = nicheOverlapScore(brief.niches, candidate.niches);
  const total = weights.semantic + weights.nicheOverlap;
  const blended = (weights.semantic * semantic + weights.nicheOverlap * overlap) / total;
  return clamp01(blended);
}

/**
 * Rank eligible, budget-compatible candidates highest-first. Ties break
 * deterministically by creatorUid so ordering is stable and reproducible.
 */
export function rankCandidates(
  brief: BriefSignal,
  candidates: readonly CandidateSignal[],
  weights: RankWeights = DEFAULT_WEIGHTS,
): RankedMatch[] {
  return candidates
    .filter((c) => c.rankable && isBudgetCompatible(brief, c))
    .map((c) => ({ creatorUid: c.creatorUid, score: scoreCandidate(brief, c, weights) }))
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.creatorUid.localeCompare(b.creatorUid),
    );
}
