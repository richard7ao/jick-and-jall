/**
 * Tier 2 evidence assertion for `pnpm state:assert-review`.
 *
 * This does NOT run the simplifier. It verifies that a stage's recorded
 * `tier2_simplify.evidence` names the required reviewer, is bound to the
 * claim's base commit, passed, and — critically — that its
 * `changed_files_sha256` still matches the current on-disk contents of the
 * stage's changed files. Any later edit invalidates the manifest.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { AGENT_IDS, type AgentId, loadState, type StageRuntime } from "./load.ts";

export type SimplificationEvidence = {
  readonly reviewer: string;
  readonly base_commit: string;
  readonly changed_files_sha256: string;
  readonly reviewer_prompt_sha256: string;
  readonly reviewed_at: string;
  readonly findings_count: number;
  readonly result: string;
};

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Deterministic manifest hash: sorted lines of `path\t<content-sha256>` over
 * the stage's changed files, then hashed. Used to produce and to assert.
 */
export function computeChangedFilesSha256(repoRoot: string, changedFiles: readonly string[]): string {
  const lines = [...changedFiles]
    .sort()
    .map((path) => `${path}\t${sha256Hex(readFileSync(join(repoRoot, path)))}`);
  return sha256Hex(lines.join("\n"));
}

function findStage(repoRoot: string, stageId: string): { agent: AgentId; stage: StageRuntime } {
  const { runtimes } = loadState(repoRoot);
  for (const agent of AGENT_IDS) {
    const stage = runtimes[agent].stages[stageId];
    if (stage) return { agent, stage };
  }
  throw new Error(`stage ${stageId} not found in any runtime file`);
}

export function assertSimplificationEvidence(
  repoRoot: string,
  stageId: string,
  requiredReviewer: string,
): void {
  const { stage } = findStage(repoRoot, stageId);
  const record = stage.verification.tier2_simplify;
  const evidence = record?.evidence as SimplificationEvidence | null | undefined;

  if (!evidence) throw new Error(`${stageId}: no tier2_simplify evidence recorded`);
  if (evidence.result !== "passed") throw new Error(`${stageId}: tier2 result is ${evidence.result}, not "passed"`);
  if (evidence.reviewer !== requiredReviewer) {
    throw new Error(`${stageId}: reviewer ${evidence.reviewer} != required ${requiredReviewer}`);
  }
  if (evidence.findings_count < 0) throw new Error(`${stageId}: findings_count must be non-negative`);

  const claimBase = stage.claim?.base_commit ?? (stage.completion as { base_commit?: string } | null)?.base_commit;
  if (!claimBase) throw new Error(`${stageId}: no claim/completion base_commit to bind evidence to`);
  if (evidence.base_commit !== claimBase) {
    throw new Error(`${stageId}: evidence base_commit ${evidence.base_commit} != claim base ${claimBase}`);
  }

  const changedFiles = (stage as unknown as { changed_files?: readonly string[] }).changed_files ?? [];
  const recomputed = computeChangedFilesSha256(repoRoot, changedFiles);
  if (recomputed !== evidence.changed_files_sha256) {
    throw new Error(`${stageId}: changed_files_sha256 mismatch — files changed since review`);
  }
}

function parseArgs(argv: readonly string[]): { stage: string; reviewer: string } {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const stage = get("--stage");
  const reviewer = get("--reviewer");
  if (!stage || !reviewer) throw new Error("usage: state:assert-review --stage <id> --reviewer <name>");
  return { stage, reviewer };
}

function main(): void {
  try {
    const { stage, reviewer } = parseArgs(process.argv.slice(2));
    assertSimplificationEvidence(process.cwd(), stage, reviewer);
    console.log(`state:assert-review ok — ${stage} Tier 2 evidence valid`);
  } catch (error) {
    console.error(`state:assert-review failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
