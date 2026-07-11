import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function GET(): Promise<Response> {
  try {
    requireRole(await getSession(), "creator");
    // Stripe Connect readiness is server-owned; disabled until Connect is wired.
    return json({ ready: false });
  } catch (error) {
    return handleError(error);
  }
}
