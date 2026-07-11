import { describe, expect, it } from "vitest";
import { type LoadedState, loadState } from "./load.ts";
import { deriveReadyFromLoaded, validateAllState, validateLoaded } from "./validate.ts";

const repoRoot = process.cwd();

/** Deep clone so each test can inject a fault without touching disk. */
function clone(loaded: LoadedState): LoadedState {
  return JSON.parse(JSON.stringify(loaded)) as LoadedState;
}

function hasProblem(problems: readonly string[], substring: string): boolean {
  return problems.some((p) => p.includes(substring));
}

describe("validateAllState (baseline)", () => {
  it("reports zero problems for the committed state", () => {
    expect(validateAllState(repoRoot)).toEqual([]);
  });
});

describe("validateLoaded (fault injection)", () => {
  it("detects a stale schedule hash", () => {
    const bad = clone(loadState(repoRoot));
    bad.runtimes["agent-2"] = { ...bad.runtimes["agent-2"], schedule_sha256: "0".repeat(64) };
    expect(hasProblem(validateLoaded(bad), "schedule_sha256 is stale")).toBe(true);
  });

  it("detects queue drift", () => {
    const bad = clone(loadState(repoRoot));
    bad.runtimes["agent-2"] = {
      ...bad.runtimes["agent-2"],
      queue: bad.runtimes["agent-2"].queue.slice(1),
    };
    expect(hasProblem(validateLoaded(bad), "queue drift")).toBe(true);
  });

  it("detects an unknown dependency", () => {
    const bad = clone(loadState(repoRoot));
    bad.global.stages["T0.2.1"] = {
      ...bad.global.stages["T0.2.1"]!,
      requires: ["T9.9.9"],
    };
    expect(hasProblem(validateLoaded(bad), "requires unknown stage T9.9.9")).toBe(true);
  });

  it("detects a dependency cycle", () => {
    const bad = clone(loadState(repoRoot));
    bad.global.stages["T0.1.1"] = { ...bad.global.stages["T0.1.1"]!, requires: ["T0.2.1"] };
    bad.global.stages["T0.2.1"] = { ...bad.global.stages["T0.2.1"]!, requires: ["T0.1.1"] };
    expect(hasProblem(validateLoaded(bad), "dependency cycle")).toBe(true);
  });

  it("detects a scope collision between two held claims", () => {
    const bad = clone(loadState(repoRoot));
    // agent-1/T0.1.1 already holds a claim over tree:scripts/state in the fixture.
    const collidingScope = [{ kind: "tree", path: "scripts/state" }] as const;
    bad.global.stages["T0.2.1"] = { ...bad.global.stages["T0.2.1"]!, writes: [...collidingScope] };
    const stage = bad.runtimes["agent-2"].stages["T0.2.1"]!;
    bad.runtimes["agent-2"].stages["T0.2.1"] = {
      ...stage,
      status: "claimed",
      write_scopes: [...collidingScope],
      claim: {
        claim_id: "T0.2.1:agent-2:1",
        assignment_epoch: 1,
        branch: "x",
        base_commit: "0".repeat(40),
        claimed_at: "2026-07-11T00:00:00Z",
        heartbeat_at: "2026-07-11T00:00:00Z",
        lease_expires_at: "2026-07-11T04:00:00Z",
      },
    };
    expect(hasProblem(validateLoaded(bad), "scope collision")).toBe(true);
  });
});

describe("deriveReadyFromLoaded", () => {
  it("excludes claimed stages and stages with unmet dependencies", () => {
    const loaded = loadState(repoRoot);
    const ready = deriveReadyFromLoaded(loaded);
    // T0.1.1 is claimed (held) → not ready; T0.2.1 requires T0.1.1 (incomplete) → not ready.
    expect(ready).not.toContain("T0.1.1");
    expect(ready).not.toContain("T0.2.1");
  });

  it("marks a dependent stage ready once its dependency is complete and unclaimed", () => {
    const loaded = clone(loadState(repoRoot));
    const t011 = loaded.runtimes["agent-1"].stages["T0.1.1"]!;
    loaded.runtimes["agent-1"].stages["T0.1.1"] = {
      ...t011,
      status: "complete",
      claim: null,
      completion: { verified_commit: "abc123" },
    };
    expect(deriveReadyFromLoaded(loaded)).toContain("T0.2.1");
  });
});
