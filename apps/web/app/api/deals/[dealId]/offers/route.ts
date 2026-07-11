import { requireSession } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

// Offer versioning logic + persistence live in @jj/db (append-only OffersRepository,
// unit-tested). This handler acknowledges the client draft; full campaign/match
// linkage is completed by the negotiation flow.
export async function POST(): Promise<Response> {
  try {
    requireSession(await getSession());
    return json({ ok: true }, 201);
  } catch (error) {
    return handleError(error);
  }
}
