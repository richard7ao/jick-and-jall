import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function POST(): Promise<Response> {
  try {
    requireRole(await getSession(), "brand");
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
