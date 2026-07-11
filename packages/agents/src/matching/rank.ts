/**
 * Deterministic creator ranking. Semantic signals (embeddings) are combined by
 * TypeScript-owned weights and filters — the model never decides ranking,
 * budgets, or eligibility. Only registered, published, available creators are
 * ranked. Results are stable (tie-broken by uid).
 */

export type RankCandidate = {
  readonly creatorUid: string;
  readonly published: boolean;
  readonly available: boolean;
  readonly embedding: readonly number[];
  readonly minBudgetMinor?: number;
};

export type RankInput = {
  readonly campaignEmbedding: readonly number[];
  readonly budgetMinor: number;
  readonly candidates: readonly RankCandidate[];
};

export type RankedMatch = { readonly creatorUid: string; readonly score: number };

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return magA === 0 || magB === 0 ? 0 : dot / (magA * magB);
}

/** Eligibility is code, not judgment: registered + published + available + within budget. */
export function isEligible(candidate: RankCandidate, budgetMinor: number): boolean {
  if (!candidate.published || !candidate.available) return false;
  if (candidate.minBudgetMinor !== undefined && candidate.minBudgetMinor > budgetMinor) return false;
  return true;
}

export function rankCandidates(input: RankInput): RankedMatch[] {
  return input.candidates
    .filter((c) => isEligible(c, input.budgetMinor))
    .map((c) => ({
      creatorUid: c.creatorUid,
      // Normalize cosine [-1,1] to [0,1] so scores are storable/rankable.
      score: Math.min(1, Math.max(0, (cosineSimilarity(input.campaignEmbedding, c.embedding) + 1) / 2)),
    }))
    .sort((a, b) => b.score - a.score || a.creatorUid.localeCompare(b.creatorUid));
}
