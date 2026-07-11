/**
 * Sanitize a raw Hermes receipt before it is committed as hackathon evidence.
 *
 * Two dangers are removed: credential-shaped strings (via the shared redaction
 * boundary) and machine-local absolute paths (which leak usernames/home dirs).
 * Reads a file argument or stdin, writes sanitized text to stdout.
 */

import { readFileSync } from "node:fs";

import { REDACTED, looksSensitive } from "./redact.ts";

/** Absolute home/user paths that would leak a developer's machine identity. */
const MACHINE_PATH_PATTERNS: readonly RegExp[] = [
  /\/Users\/[^\s"'`)]+/g,
  /\/home\/[^\s"'`)]+/g,
  /[A-Za-z]:\\Users\\[^\s"'`)]+/g,
];

export function redactMachinePaths(text: string): string {
  return MACHINE_PATH_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "<PATH>"), text);
}

/** Redact any whitespace-delimited token that looks like a credential. */
function redactCredentialTokens(text: string): string {
  return text.replace(/\S+/g, (token) => (looksSensitive(token) ? REDACTED : token));
}

export function sanitizeReceiptText(text: string): string {
  return redactCredentialTokens(redactMachinePaths(text));
}

function readInput(): string {
  const fileArg = process.argv[2];
  if (fileArg) return readFileSync(fileArg, "utf8");
  return readFileSync(0, "utf8"); // stdin
}

function main(): void {
  process.stdout.write(sanitizeReceiptText(readInput()));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
