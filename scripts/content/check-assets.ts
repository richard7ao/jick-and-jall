/**
 * Reference-asset rights validator.
 *
 * Every entry in `docs/references/assets.json` must have complete rights
 * metadata (source URL, author, license, intended use) and a local file that
 * actually exists. This keeps reference assets accountable and prevents
 * referencing material we do not have on disk.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isValidScopePath } from "../state/scopes.ts";

export type AssetEntry = {
  readonly id: string;
  readonly localPath: string;
  readonly sourceUrl: string;
  readonly author: string;
  readonly license: string;
  readonly intendedUse: string;
};

const REQUIRED_FIELDS: readonly (keyof AssetEntry)[] = [
  "id",
  "localPath",
  "sourceUrl",
  "author",
  "license",
  "intendedUse",
];

export function checkAssets(repoRoot: string): readonly string[] {
  const manifestPath = join(repoRoot, "docs/references/assets.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { assets?: unknown };
  const assets = manifest.assets;
  if (!Array.isArray(assets)) return ["assets.json: `assets` must be an array"];

  const problems: string[] = [];
  const seenIds = new Set<string>();

  assets.forEach((raw, index) => {
    const entry = raw as Partial<AssetEntry>;
    const label = entry.id ?? `#${index}`;

    for (const field of REQUIRED_FIELDS) {
      const value = entry[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        problems.push(`asset ${label}: missing/empty "${field}"`);
      }
    }

    if (entry.id) {
      if (seenIds.has(entry.id)) problems.push(`asset ${label}: duplicate id`);
      seenIds.add(entry.id);
    }

    if (typeof entry.localPath === "string" && entry.localPath.length > 0) {
      if (!isValidScopePath(entry.localPath)) {
        problems.push(`asset ${label}: localPath is not a safe repo-relative path`);
      } else if (!existsSync(join(repoRoot, entry.localPath))) {
        problems.push(`asset ${label}: localPath does not exist (${entry.localPath})`);
      }
    }
  });

  return problems;
}

function main(): void {
  const problems = checkAssets(process.cwd());
  if (problems.length === 0) {
    console.log("content:check-assets ok — all reference assets present and rights-tagged");
    return;
  }
  console.error(`content:check-assets found ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
