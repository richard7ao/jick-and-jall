/**
 * Typed loading of the three committed state files plus the source hashes the
 * schedule pins. All reads are pure; nothing here mutates the repository.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { WriteScope } from "./scopes.ts";

export const AGENT_IDS = ["agent-1", "agent-2"] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export type StageSchedule = {
  readonly task_id: string;
  readonly step_id: string;
  readonly title: string;
  readonly schedule_status: string;
  readonly owner: AgentId;
  readonly assignment_epoch: number;
  readonly queue_rank: number;
  readonly weight: number;
  readonly requires: readonly string[];
  readonly gate_requires: readonly string[];
  readonly writes: readonly WriteScope[];
};

export type GlobalSchedule = {
  readonly schema_version: string;
  readonly kind: string;
  readonly agents: readonly string[];
  readonly source: { readonly spec_sha256: string; readonly plan_sha256: string; readonly design_sha256: string; readonly spec_path: string; readonly plan_path: string; readonly design_path: string };
  readonly stages: Record<string, StageSchedule>;
  readonly steps: readonly { readonly id: string; readonly stage_ids: readonly string[] }[];
  readonly tasks: readonly { readonly id: string; readonly step_ids: readonly string[] }[];
};

export type Claim = {
  readonly claim_id: string;
  readonly assignment_epoch: number;
  readonly branch: string;
  readonly base_commit: string;
  readonly claimed_at: string;
  readonly heartbeat_at: string;
  readonly lease_expires_at: string;
};

export type StageRuntime = {
  readonly owner: AgentId;
  readonly queue_rank: number;
  readonly write_scopes: readonly WriteScope[];
  readonly status: string;
  readonly claim: Claim | null;
  readonly completion: { readonly verified_commit?: string } | null;
  readonly blockers: readonly { readonly kind: string; readonly resolved?: boolean }[];
  readonly verification: Record<string, { readonly status: string; readonly evidence?: unknown }>;
};

export type AgentRuntime = {
  readonly kind: string;
  readonly agent_id: AgentId;
  readonly schedule_sha256: string;
  readonly source: { readonly spec_sha256: string; readonly plan_sha256: string };
  readonly queue: readonly string[];
  readonly active_stage_id: string | null;
  readonly stages: Record<string, StageRuntime>;
};

export type LoadedState = {
  readonly repoRoot: string;
  readonly global: GlobalSchedule;
  readonly globalSha256: string;
  readonly runtimes: Record<AgentId, AgentRuntime>;
};

export function sha256OfFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function statePaths(repoRoot: string) {
  return {
    global: join(repoRoot, "tasks/state.json"),
    "agent-1": join(repoRoot, "tasks/state-agent-1.json"),
    "agent-2": join(repoRoot, "tasks/state-agent-2.json"),
  } as const;
}

export function loadState(repoRoot: string): LoadedState {
  const paths = statePaths(repoRoot);
  return {
    repoRoot,
    global: readJson<GlobalSchedule>(paths.global),
    globalSha256: sha256OfFile(paths.global),
    runtimes: {
      "agent-1": readJson<AgentRuntime>(paths["agent-1"]),
      "agent-2": readJson<AgentRuntime>(paths["agent-2"]),
    },
  };
}
