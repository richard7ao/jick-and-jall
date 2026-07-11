/**
 * Guide contract validator. Every manual test guide under docs/testing/ must
 * contain the same required sections so guides are complete and comparable.
 * Powers `pnpm guides:validate`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const REQUIRED_SECTIONS = [
  "## Scope",
  "## Preconditions",
  "## Automated verification",
  "## Manual checks",
] as const;

const CONTRACT_FILE = "GUIDE-CONTRACT.md";

export function validateGuide(markdown: string): string[] {
  return REQUIRED_SECTIONS.filter((section) => !markdown.includes(section)).map(
    (section) => `missing section "${section}"`,
  );
}

export function validateGuidesDir(repoRoot: string): string[] {
  const dir = join(repoRoot, "docs/testing");
  const guides = readdirSync(dir).filter((f) => f.endsWith(".md") && f !== CONTRACT_FILE);
  if (guides.length === 0) return ["docs/testing: no guides found"];

  const problems: string[] = [];
  for (const file of guides) {
    for (const problem of validateGuide(readFileSync(join(dir, file), "utf8"))) {
      problems.push(`${file}: ${problem}`);
    }
  }
  return problems;
}

function main(): void {
  const problems = validateGuidesDir(process.cwd());
  if (problems.length === 0) {
    console.log("guides:validate ok — all guides satisfy the contract");
    return;
  }
  console.error(`guides:validate found ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
