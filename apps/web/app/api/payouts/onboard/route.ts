import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function POST(): Promise<Response> {
  try {
    requireRole(await getSession(), "creator");
    // Returns a Connect onboarding URL once Stripe is configured; none yet.
    return json({});
  } catch (error) {
    return handleError(error);
  }
}
