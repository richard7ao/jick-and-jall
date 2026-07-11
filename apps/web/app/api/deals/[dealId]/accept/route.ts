import { requireSession } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function POST(): Promise<Response> {
  try {
    requireSession(await getSession());
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
