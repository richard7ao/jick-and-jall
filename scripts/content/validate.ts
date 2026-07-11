/**
 * Bilingual content contract validator.
 *
 * Enforces that every locale file matches the canonical key structure in
 * `content/schema.json`, that all leaves are non-empty strings, and that
 * English and Spanish are structurally identical (behavioral equivalence).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

type SchemaNode = {
  readonly type: string;
  readonly properties?: Record<string, SchemaNode>;
  readonly required?: readonly string[];
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

/** Collect problems where `value` deviates from `schema`, prefixed by `path`. */
function checkAgainstSchema(schema: SchemaNode, value: unknown, path: string): string[] {
  if (schema.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return [`${path || "(root)"}: expected object`];
    }
    const record = value as Record<string, unknown>;
    const problems: string[] = [];
    const allowed = new Set(Object.keys(schema.properties ?? {}));
    for (const required of schema.required ?? []) {
      if (!(required in record)) problems.push(`${path}${required}: missing required key`);
    }
    for (const key of Object.keys(record)) {
      if (!allowed.has(key)) problems.push(`${path}${key}: unexpected key`);
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (key in record) problems.push(...checkAgainstSchema(childSchema, record[key], `${path}${key}.`));
    }
    return problems;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") return [`${path.slice(0, -1)}: expected string`];
    if (value.trim().length === 0) return [`${path.slice(0, -1)}: must be a non-empty string`];
  }
  return [];
}

/** Sorted list of dotted leaf paths, used for cross-locale parity. */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

export function validateContent(contentDir: string): readonly string[] {
  const schema = readJson<SchemaNode>(join(contentDir, "schema.json"));
  const problems: string[] = [];
  const localeLeaves: Record<string, string[]> = {};

  for (const locale of LOCALES) {
    const data = readJson<unknown>(join(contentDir, `${locale}.json`));
    problems.push(...checkAgainstSchema(schema, data, "").map((p) => `[${locale}] ${p}`));
    localeLeaves[locale] = leafPaths(data);
    if ((data as { meta?: { locale?: string } })?.meta?.locale !== locale) {
      problems.push(`[${locale}] meta.locale must equal "${locale}"`);
    }
  }

  // Parity: every locale must expose the same leaf key set.
  const [base, ...rest] = LOCALES;
  for (const other of rest) {
    const baseSet = new Set(localeLeaves[base]);
    const otherSet = new Set(localeLeaves[other]);
    for (const key of localeLeaves[base]!) {
      if (!otherSet.has(key)) problems.push(`parity: "${key}" present in ${base} but missing in ${other}`);
    }
    for (const key of localeLeaves[other]!) {
      if (!baseSet.has(key)) problems.push(`parity: "${key}" present in ${other} but missing in ${base}`);
    }
  }
  return problems;
}

function main(): void {
  const contentDir = join(process.cwd(), "content");
  const problems = validateContent(contentDir);
  if (problems.length === 0) {
    console.log("content:validate ok — en/es parity and schema satisfied");
    return;
  }
  console.error(`content:validate found ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
