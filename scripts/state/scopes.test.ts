import { describe, expect, it } from "vitest";
import { isValidScopePath, normalizeScopePath, pathInScopes, scopesIntersect, type WriteScope } from "./scopes.ts";

const file = (path: string): WriteScope => ({ kind: "file", path });
const tree = (path: string): WriteScope => ({ kind: "tree", path });

describe("isValidScopePath", () => {
  it("accepts repo-relative POSIX paths", () => {
    expect(isValidScopePath("packages/db/src/index.ts")).toBe(true);
    expect(isValidScopePath("scripts/state")).toBe(true);
  });

  it("rejects absolute, traversal, backslash, trailing-slash, and empty paths", () => {
    expect(isValidScopePath("/etc/passwd")).toBe(false);
    expect(isValidScopePath("../secrets")).toBe(false);
    expect(isValidScopePath("a/../b")).toBe(false);
    expect(isValidScopePath("a\\b")).toBe(false);
    expect(isValidScopePath("a//b")).toBe(false);
    expect(isValidScopePath("a/")).toBe(false);
    expect(isValidScopePath("")).toBe(false);
  });

  it("normalizeScopePath throws on invalid input", () => {
    expect(() => normalizeScopePath("../x")).toThrow();
    expect(normalizeScopePath("a/b")).toBe("a/b");
  });
});

describe("scopesIntersect", () => {
  it("equal files collide; different files do not", () => {
    expect(scopesIntersect(file("a/b.ts"), file("a/b.ts"))).toBe(true);
    expect(scopesIntersect(file("a/b.ts"), file("a/c.ts"))).toBe(false);
  });

  it("a file inside a tree collides", () => {
    expect(scopesIntersect(tree("apps/web"), file("apps/web/app/page.tsx"))).toBe(true);
    expect(scopesIntersect(file("apps/web/app/page.tsx"), tree("apps/web"))).toBe(true);
  });

  it("a sibling file outside a tree does not collide", () => {
    expect(scopesIntersect(tree("apps/web"), file("apps/api/route.ts"))).toBe(false);
    // prefix-but-not-nested must not false-positive
    expect(scopesIntersect(tree("apps/web"), file("apps/website/x.ts"))).toBe(false);
  });

  it("ancestor/descendant trees collide; disjoint trees do not", () => {
    expect(scopesIntersect(tree("packages"), tree("packages/db"))).toBe(true);
    expect(scopesIntersect(tree("packages/db"), tree("packages"))).toBe(true);
    expect(scopesIntersect(tree("packages"), tree("packages"))).toBe(true);
    expect(scopesIntersect(tree("packages/db"), tree("packages/auth"))).toBe(false);
  });
});

describe("pathInScopes", () => {
  const scopes: WriteScope[] = [tree("scripts/bootstrap"), file("scripts/tsconfig.json")];
  it("accepts governed paths and rejects others", () => {
    expect(pathInScopes("scripts/bootstrap/redact.ts", scopes)).toBe(true);
    expect(pathInScopes("scripts/tsconfig.json", scopes)).toBe(true);
    expect(pathInScopes("scripts/state/validate.ts", scopes)).toBe(false);
  });
});
