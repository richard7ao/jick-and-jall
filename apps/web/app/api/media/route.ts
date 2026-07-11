import { getRepositories } from "@jj/db";
import { canAccessMedia } from "@jj/auth";

import { fail, getSession, handleError, json } from "@/lib/server/api";

/**
 * Owner-only media access. There is no public or cross-user read path; a
 * short-lived signed URL is issued (by Storage in production) only after the
 * owner check passes.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const session = await getSession();
    const sessionId = new URL(request.url).searchParams.get("sessionId");
    if (!sessionId) return fail(400, "missing sessionId");

    const record = await getRepositories().voiceSessions.getById(sessionId);
    if (!record) return fail(404, "not found");
    if (!canAccessMedia(session, record.uid)) return fail(403, "forbidden");

    return json({ url: `/private/recordings/${sessionId}`, expiresInSeconds: 300 });
  } catch (error) {
    return handleError(error);
  }
}
