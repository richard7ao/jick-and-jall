import { getRepositories } from "@jj/db";
import { requireOwner } from "@jj/auth";

import { fail, getSession, handleError, json } from "@/lib/server/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const repos = getRepositories();
    const record = await repos.voiceSessions.getById(id);
    if (!record) return fail(404, "not found");
    requireOwner(await getSession(), record.uid);
    // Deleting here removes the session; production also propagates upstream.
    await repos.voiceSessions.remove(id);
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
