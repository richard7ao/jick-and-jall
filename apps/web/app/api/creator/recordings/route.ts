import { getRepositories } from "@jj/db";
import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function GET(): Promise<Response> {
  try {
    const session = requireRole(await getSession(), "creator");
    const sessions = await getRepositories().voiceSessions.listByUid(session.uid);
    // Media URLs are issued only via the authorized media endpoint, never here.
    return json(
      sessions.map((s) => ({ id: s.id, createdAt: s.createdAt })),
    );
  } catch (error) {
    return handleError(error);
  }
}
