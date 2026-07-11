import type { Principal } from "./authorization.js";

/**
 * Private media authorization. Access is limited to the resource owner or an
 * allowlisted administrator. Callers must return an *indistinguishable*
 * not-found response for both "denied" and "missing" so existence never leaks.
 */

export type MediaAccessDecision = "allow" | "deny";

export function decideMediaAccess(
  principal: Principal | null,
  ownerUid: string,
  admins: ReadonlySet<string> = new Set(),
): MediaAccessDecision {
  if (!principal) return "deny";
  if (principal.uid === ownerUid) return "allow";
  if (admins.has(principal.uid)) return "allow";
  return "deny";
}

/** Owner-scoped storage path for a user's private recordings. */
export function recordingPath(ownerUid: string, recordingId: string): string {
  return `recordings/${ownerUid}/${recordingId}`;
}

/** Extract the owner uid from a recordings path, or null if it is not one. */
export function ownerFromRecordingPath(path: string): string | null {
  const match = /^recordings\/([^/]+)\/[^/]+$/.exec(path);
  return match?.[1] ?? null;
}
