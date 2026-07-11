import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { checkAssets } from "./check-assets.ts";

const repoRoot = process.cwd();
const dir = mkdtempSync(join(tmpdir(), "jj-assets-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function writeManifest(assets: unknown) {
  mkdirSync(join(dir, "docs/references"), { recursive: true });
  writeFileSync(join(dir, "docs/references/assets.json"), JSON.stringify({ assets }));
}

const validEntry = {
  id: "a",
  localPath: "docs/references/present.png",
  sourceUrl: "https://example.com",
  author: "Someone",
  license: "reference-only",
  intendedUse: "inspiration",
};

describe("checkAssets (committed manifest)", () => {
  it("passes for the real reference manifest", () => {
    expect(checkAssets(repoRoot)).toEqual([]);
  });
});

describe("checkAssets (fault injection)", () => {
  it("flags a missing local file", () => {
    writeManifest([validEntry]); // present.png not created
    expect(checkAssets(dir).some((p) => p.includes("does not exist"))).toBe(true);
  });

  it("flags an incomplete rights entry", () => {
    writeManifest([{ ...validEntry, license: "" }]);
    expect(checkAssets(dir).some((p) => p.includes('missing/empty "license"'))).toBe(true);
  });

  it("flags a duplicate id", () => {
    writeFileSync(join(dir, "docs/references/present.png"), "x");
    writeManifest([validEntry, validEntry]);
    expect(checkAssets(dir).some((p) => p.includes("duplicate id"))).toBe(true);
  });
});
