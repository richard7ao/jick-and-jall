import { describe, expect, it } from "vitest";
import { redactMachinePaths, sanitizeReceiptText } from "./sanitize-hermes-receipt.mts";
import { REDACTED } from "./redact.ts";

describe("redactMachinePaths", () => {
  it("replaces home/user absolute paths with a placeholder", () => {
    expect(redactMachinePaths("edited /Users/alice/repo/x.ts here")).toBe("edited <PATH> here");
    expect(redactMachinePaths("at /home/bob/app/y.ts")).toBe("at <PATH>");
    expect(redactMachinePaths("win C:\\Users\\carol\\z.ts")).toBe("win <PATH>");
  });

  it("leaves repo-relative paths untouched", () => {
    expect(redactMachinePaths("see scripts/state/validate.ts")).toBe("see scripts/state/validate.ts");
  });
});

describe("sanitizeReceiptText", () => {
  it("redacts both credentials and machine paths", () => {
    const raw = "ran in /Users/dev/jj with key sk_test_abcd1234EFGH5678 ok";
    const out = sanitizeReceiptText(raw);
    expect(out).toContain("<PATH>");
    expect(out).toContain(REDACTED);
    expect(out).not.toContain("sk_test_abcd1234EFGH5678");
    expect(out).not.toContain("/Users/dev");
  });

  it("is a no-op for already-clean text", () => {
    const clean = "Reviewed scripts/state/scopes.ts; suggested extracting isUnderTree.";
    expect(sanitizeReceiptText(clean)).toBe(clean);
  });
});
