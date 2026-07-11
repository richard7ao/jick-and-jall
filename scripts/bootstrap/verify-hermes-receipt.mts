/**
 * Verify committed Hermes receipts contain no secrets or machine-local paths.
 *
 * Scans every markdown receipt under docs/hackathon/hermes-receipts/ and fails
 * loudly if any credential-shaped token or absolute home path survived
 * sanitization. Powers `pnpm hermes:verify-receipt`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { looksSensitive } from "./redact.ts";

const RECEIPTS_DIR = "docs/hackathon/hermes-receipts";
const MACHINE_PATH = /(\/Users\/|\/home\/|[A-Za-z]:\\Users\\)[^\s"'`)]+/;

export function findLeaks(text: string): readonly string[] {
  const leaks: string[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (MACHINE_PATH.test(line)) leaks.push(`line ${index + 1}: machine-local path`);
    for (const token of line.split(/\s+/)) {
      if (looksSensitive(token)) leaks.push(`line ${index + 1}: credential-shaped token`);
    }
  });
  return leaks;
}

export function verifyReceipts(repoRoot: string): readonly string[] {
  const dir = join(repoRoot, RECEIPTS_DIR);
  const files = readdirSync(dir).filter((name) => name.endsWith(".md"));
  if (files.length === 0) return [`${RECEIPTS_DIR}: no receipt (*.md) committed`];

  const problems: string[] = [];
  for (const file of files) {
    for (const leak of findLeaks(readFileSync(join(dir, file), "utf8"))) {
      problems.push(`${file}: ${leak}`);
    }
  }
  return problems;
}

function main(): void {
  try {
    const problems = verifyReceipts(process.cwd());
    if (problems.length === 0) {
      console.log("hermes:verify-receipt ok — receipts sanitized");
      return;
    }
    console.error(`hermes:verify-receipt found ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  } catch (error) {
    console.error(`hermes:verify-receipt failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
