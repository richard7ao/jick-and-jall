/**
 * Strict validator for the v3 three-file state protocol.
 *
 * `validateAllState` returns a list of human-readable problems (empty means
 * valid). It reads only; readiness is derived, never written. The CLI at the
 * bottom powers `pnpm state:validate` and exits non-zero on any problem.
 */

import { join } from "node:path";

import {
  AGENT_IDS,
  type AgentId,
  type LoadedState,
  loadState,
  sha256OfFile,
  type StageRuntime,
} from "./load.ts";
import { isValidScopePath, scopesIntersect, type WriteScope } from "./scopes.ts";

const HELD_CLAIM_STATUSES = new Set(["claimed", "in_progress"]);

function scopeKey(scope: WriteScope): string {
  return `${scope.kind}:${scope.path}`;
}

function sameScopeSet(a: readonly WriteScope[], b: readonly WriteScope[]): boolean {
  const left = a.map(scopeKey).sort();
  const right = b.map(scopeKey).sort();
  return left.length === right.length && left.every((value, i) => value === right[i]);
}

function isComplete(stage: StageRuntime | undefined): boolean {
  return stage?.status === "complete" && Boolean(stage.completion?.verified_commit);
}

/** Detect dependency cycles in the global `requires` graph via DFS coloring. */
function findRequiresCycle(stages: Record<string, { requires: readonly string[] }>): string | null {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const color = new Map<string, number>(Object.keys(stages).map((id) => [id, WHITE]));

  const visit = (id: string, path: string[]): string | null => {
    color.set(id, GREY);
    for (const dep of stages[id]?.requires ?? []) {
      if (!(dep in stages)) continue;
      if (color.get(dep) === GREY) return [...path, id, dep].join(" -> ");
      if (color.get(dep) === WHITE) {
        const found = visit(dep, [...path, id]);
        if (found) return found;
      }
    }
    color.set(id, BLACK);
    return null;
  };

  for (const id of Object.keys(stages)) {
    if (color.get(id) === WHITE) {
      const cycle = visit(id, []);
      if (cycle) return cycle;
    }
  }
  return null;
}

type HeldClaim = { readonly agent: AgentId; readonly stageId: string; readonly scopes: readonly WriteScope[] };

export function validateLoaded(loaded: LoadedState): readonly string[] {
  const problems: string[] = [];
  const { global, globalSha256, repoRoot, runtimes } = loaded;

  if (global.kind !== "global_schedule") problems.push(`global kind must be "global_schedule", got ${global.kind}`);
  if (global.agents.join(",") !== AGENT_IDS.join(",")) {
    problems.push(`global agents must be ${AGENT_IDS.join(", ")}`);
  }

  // Source document hashes must match the pinned files.
  for (const [key, path] of [
    ["spec_sha256", global.source.spec_path],
    ["plan_sha256", global.source.plan_path],
    ["design_sha256", global.source.design_path],
  ] as const) {
    const actual = sha256OfFile(join(repoRoot, path));
    if (global.source[key] !== actual) problems.push(`stale ${key}: ${path} hash drifted`);
  }

  // Requires must reference known stages and be acyclic.
  for (const [id, stage] of Object.entries(global.stages)) {
    for (const dep of stage.requires) {
      if (!(dep in global.stages)) problems.push(`stage ${id} requires unknown stage ${dep}`);
    }
    for (const scope of stage.writes) {
      if (!isValidScopePath(scope.path)) problems.push(`stage ${id} has invalid write path ${scope.path}`);
    }
  }
  const cycle = findRequiresCycle(global.stages);
  if (cycle) problems.push(`dependency cycle: ${cycle}`);

  const heldClaims: HeldClaim[] = [];

  for (const agent of AGENT_IDS) {
    const runtime = runtimes[agent];
    if (runtime.kind !== "agent_runtime") problems.push(`${agent} kind must be "agent_runtime"`);
    if (runtime.agent_id !== agent) problems.push(`${agent} runtime agent_id mismatch (${runtime.agent_id})`);
    if (runtime.schedule_sha256 !== globalSha256) problems.push(`${agent} schedule_sha256 is stale`);
    if (runtime.source.spec_sha256 !== global.source.spec_sha256) problems.push(`${agent} spec_sha256 disagrees with schedule`);
    if (runtime.source.plan_sha256 !== global.source.plan_sha256) problems.push(`${agent} plan_sha256 disagrees with schedule`);

    // Expected owned active stages, sorted by queue_rank, must mirror the queue.
    const owned = Object.entries(global.stages)
      .filter(([, s]) => s.owner === agent && s.schedule_status === "active")
      .sort((a, b) => a[1].queue_rank - b[1].queue_rank)
      .map(([id]) => id);
    if (runtime.queue.join(",") !== owned.join(",")) {
      problems.push(`${agent} queue drift: expected [${owned.join(", ")}]`);
    }

    let activeClaimCount = 0;
    for (const [id, stage] of Object.entries(runtime.stages)) {
      const scheduled = global.stages[id];
      if (!scheduled) {
        problems.push(`${agent} has runtime stage ${id} absent from the schedule`);
        continue;
      }
      if (scheduled.owner !== agent) problems.push(`${agent} owns runtime stage ${id} but schedule assigns ${scheduled.owner}`);
      if (stage.queue_rank !== scheduled.queue_rank) problems.push(`${agent} stage ${id} queue_rank disagrees with schedule`);
      if (!sameScopeSet(stage.write_scopes, scheduled.writes)) problems.push(`${agent} stage ${id} write_scopes disagree with schedule writes`);

      if (stage.claim && HELD_CLAIM_STATUSES.has(stage.status)) {
        activeClaimCount += 1;
        heldClaims.push({ agent, stageId: id, scopes: stage.write_scopes });
      }
    }

    if (activeClaimCount > 1) problems.push(`${agent} holds ${activeClaimCount} active claims (max 1)`);
    if (runtime.active_stage_id && !(runtime.active_stage_id in runtime.stages)) {
      problems.push(`${agent} active_stage_id ${runtime.active_stage_id} is not a known runtime stage`);
    }
  }

  // Scope collisions across all held claims for distinct stages.
  for (let i = 0; i < heldClaims.length; i += 1) {
    for (let j = i + 1; j < heldClaims.length; j += 1) {
      const a = heldClaims[i]!;
      const b = heldClaims[j]!;
      if (a.stageId === b.stageId) continue;
      const collision = a.scopes.some((left) => b.scopes.some((right) => scopesIntersect(left, right)));
      if (collision) problems.push(`scope collision between ${a.agent}/${a.stageId} and ${b.agent}/${b.stageId}`);
    }
  }

  return problems;
}

export function validateAllState(repoRoot: string): readonly string[] {
  return validateLoaded(loadState(repoRoot));
}

/** A stage is ready when it is active, unclaimed/incomplete, gate-clear, and all deps are complete. */
export function deriveReadyFromLoaded(loaded: LoadedState): readonly string[] {
  const { global, runtimes } = loaded;
  const runtimeStage = (id: string): StageRuntime | undefined =>
    runtimes["agent-1"].stages[id] ?? runtimes["agent-2"].stages[id];

  return Object.entries(global.stages)
    .filter(([id, stage]) => {
      if (stage.schedule_status !== "active") return false;
      const rt = runtimeStage(id);
      if (isComplete(rt)) return false;
      if (rt?.claim && HELD_CLAIM_STATUSES.has(rt.status)) return false;
      if (rt?.blockers.some((b) => b.resolved === false)) return false;
      const depsMet = stage.requires.every((dep) => isComplete(runtimeStage(dep)));
      const gatesMet = stage.gate_requires.every((gate) => isComplete(runtimeStage(gate)));
      return depsMet && gatesMet;
    })
    .map(([id]) => id)
    .sort((a, b) => global.stages[a]!.queue_rank - global.stages[b]!.queue_rank);
}

export function deriveReadyStages(repoRoot: string): readonly string[] {
  return deriveReadyFromLoaded(loadState(repoRoot));
}

function main(): void {
  const repoRoot = process.cwd();
  const problems = validateAllState(repoRoot);
  if (problems.length === 0) {
    console.log("state:validate ok — 3-file protocol consistent");
    return;
  }
  console.error(`state:validate found ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
