/**
 * Read-only progress report derived from the three state files.
 *
 * `pnpm state:report` prints a summary; `pnpm state:report --check` also runs
 * the validator and exits non-zero on any inconsistency (used by Tier 4).
 */

import { AGENT_IDS, loadState } from "./load.ts";
import { deriveReadyStages, validateAllState } from "./validate.ts";

type Progress = { readonly complete: number; readonly total: number; readonly weightDone: number; readonly weightTotal: number };

function progressForAgent(repoRoot: string, agent: (typeof AGENT_IDS)[number]): Progress {
  const { global, runtimes } = loadState(repoRoot);
  const runtime = runtimes[agent];
  const owned = Object.entries(global.stages).filter(([, s]) => s.owner === agent && s.schedule_status === "active");
  let complete = 0;
  let weightDone = 0;
  let weightTotal = 0;
  for (const [id, stage] of owned) {
    weightTotal += stage.weight;
    const rt = runtime.stages[id];
    if (rt?.status === "complete" && rt.completion?.verified_commit) {
      complete += 1;
      weightDone += stage.weight;
    }
  }
  return { complete, total: owned.length, weightDone, weightTotal };
}

export function buildReport(repoRoot: string): string {
  const lines: string[] = ["Jick & Jall — derived progress"];
  for (const agent of AGENT_IDS) {
    const p = progressForAgent(repoRoot, agent);
    lines.push(`  ${agent}: ${p.complete}/${p.total} stages, weight ${p.weightDone}/${p.weightTotal}`);
  }
  const ready = deriveReadyStages(repoRoot);
  lines.push(`  ready now: ${ready.length ? ready.join(", ") : "(none)"}`);
  return lines.join("\n");
}

function main(): void {
  const repoRoot = process.cwd();
  const check = process.argv.slice(2).includes("--check");
  console.log(buildReport(repoRoot));

  if (check) {
    const problems = validateAllState(repoRoot);
    if (problems.length > 0) {
      console.error(`state:report --check failed with ${problems.length} problem(s)`);
      for (const problem of problems) console.error(`  - ${problem}`);
      process.exit(1);
    }
    console.log("state:report --check ok");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
