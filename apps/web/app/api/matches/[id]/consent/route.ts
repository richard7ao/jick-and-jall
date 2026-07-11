import { getRepositories } from "@jj/db";
import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

interface ConsentBody {
  decision?: "accepted" | "declined";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    requireRole(await getSession(), "creator");
    const { id } = await params;
    const b = (await request.json().catch(() => ({}))) as ConsentBody;
    // Disclosure is revealed only on an explicit accept.
    await getRepositories().matches.setConsent(id, b.decision === "accepted");
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
