import type { Role } from "@jj/shared";

import type { SessionPayload } from "./session.js";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function requireSession(
  session: SessionPayload | null,
): SessionPayload {
  if (!session) throw new AuthorizationError("authentication required", 401);
  return session;
}

export function requireRole(
  session: SessionPayload | null,
  role: Role,
): SessionPayload {
  const active = requireSession(session);
  if (active.role !== role) {
    throw new AuthorizationError(`requires ${role} role`, 403);
  }
  return active;
}

export function requireOwner(
  session: SessionPayload | null,
  ownerUid: string,
): SessionPayload {
  const active = requireSession(session);
  if (active.uid !== ownerUid) {
    throw new AuthorizationError("not the owner of this resource", 403);
  }
  return active;
}
