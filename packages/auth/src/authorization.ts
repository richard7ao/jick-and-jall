import type { Role } from "@jj/shared";

/**
 * Deterministic authorization helpers. Roles are immutable per account; there
 * is no role switching. Authorization is code, never model judgment.
 */

export class AuthorizationError extends Error {
  constructor(message = "not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type Principal = { readonly uid: string; readonly role: Role };

export function isOwner(principal: Principal | null, ownerUid: string): boolean {
  return principal?.uid === ownerUid;
}

export function hasRole(principal: Principal | null, role: Role): boolean {
  return principal?.role === role;
}

/** Throw unless the principal is the owner of the resource. */
export function assertOwner(principal: Principal | null, ownerUid: string): void {
  if (!isOwner(principal, ownerUid)) throw new AuthorizationError("owner mismatch");
}

/** Throw unless the principal holds the required role. */
export function assertRole(principal: Principal | null, role: Role): void {
  if (!hasRole(principal, role)) throw new AuthorizationError("role mismatch");
}
