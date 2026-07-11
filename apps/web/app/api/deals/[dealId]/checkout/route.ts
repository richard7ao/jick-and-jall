import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

// Stripe Checkout is created here once `stripe` is configured; payment is then
// confirmed server-side via webhook, never from the browser return URL. Until
// then no checkout URL is returned, so the client performs no charge.
export async function POST(): Promise<Response> {
  try {
    requireRole(await getSession(), "brand");
    return json({});
  } catch (error) {
    return handleError(error);
  }
}
