import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { computeChangedFilesSha256 } from "./assert-review.ts";

const dir = mkdtempSync(join(tmpdir(), "jj-manifest-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("computeChangedFilesSha256", () => {
  it("is order-independent and content-sensitive", () => {
    writeFileSync(join(dir, "a.ts"), "alpha");
    writeFileSync(join(dir, "b.ts"), "beta");

    const forward = computeChangedFilesSha256(dir, ["a.ts", "b.ts"]);
    const reversed = computeChangedFilesSha256(dir, ["b.ts", "a.ts"]);
    expect(forward).toBe(reversed);

    writeFileSync(join(dir, "b.ts"), "beta-changed");
    const afterEdit = computeChangedFilesSha256(dir, ["a.ts", "b.ts"]);
    expect(afterEdit).not.toBe(forward);
  });

  it("produces a stable 64-char hex digest", () => {
    writeFileSync(join(dir, "a.ts"), "alpha");
    expect(computeChangedFilesSha256(dir, ["a.ts"])).toMatch(/^[0-9a-f]{64}$/);
  });
});
