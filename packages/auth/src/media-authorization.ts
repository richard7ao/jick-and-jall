import type { SessionPayload } from "./session.js";

/**
 * Private media (recordings, transcripts) is owner-only. There is no public or
 * cross-user read path; a signed URL is issued only after this check passes.
 */
export function canAccessMedia(
  session: SessionPayload | null,
  ownerUid: string,
): boolean {
  return session !== null && session.uid === ownerUid;
}
