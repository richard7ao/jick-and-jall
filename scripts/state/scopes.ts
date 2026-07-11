/**
 * Write-scope model and collision detection for the v3 coordination protocol.
 *
 * Scopes are normalized repo-relative exact files or directory trees. Two
 * scopes collide when files are equal, a file lies inside a tree, or either
 * tree is an ancestor of (or equal to) the other.
 */

export type WriteScope = Readonly<
  { kind: "file"; path: string } | { kind: "tree"; path: string }
>;

/** A scope path is repo-relative POSIX with no `.`/`..`, absolute, or empty segments. */
export function isValidScopePath(path: string): boolean {
  if (path.length === 0) return false;
  if (path.startsWith("/")) return false;
  if (path.includes("\\")) return false;
  if (path.includes("//")) return false;
  if (path.endsWith("/")) return false;
  const segments = path.split("/");
  return segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

/** Validate and return the path unchanged, or throw with a precise reason. */
export function normalizeScopePath(path: string): string {
  if (!isValidScopePath(path)) {
    throw new Error(`invalid scope path: ${JSON.stringify(path)}`);
  }
  return path;
}

/** True when `inner` is the same path as, or nested under, directory `tree`. */
function isUnderTree(inner: string, tree: string): boolean {
  return inner === tree || inner.startsWith(`${tree}/`);
}

/** True when the two scopes govern any overlapping path. */
export function scopesIntersect(left: WriteScope, right: WriteScope): boolean {
  const a = normalizeScopePath(left.path);
  const b = normalizeScopePath(right.path);

  if (left.kind === "file" && right.kind === "file") return a === b;
  if (left.kind === "tree" && right.kind === "file") return isUnderTree(b, a);
  if (left.kind === "file" && right.kind === "tree") return isUnderTree(a, b);
  // tree vs tree: collide if either is an ancestor of (or equal to) the other.
  return isUnderTree(a, b) || isUnderTree(b, a);
}

/** True when a changed repo-relative path is governed by at least one scope. */
export function pathInScopes(changedPath: string, scopes: readonly WriteScope[]): boolean {
  const target = normalizeScopePath(changedPath);
  return scopes.some((scope) => {
    const base = normalizeScopePath(scope.path);
    return scope.kind === "file" ? target === base : isUnderTree(target, base);
  });
}
