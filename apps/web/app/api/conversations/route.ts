import { requireSession } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function GET(): Promise<Response> {
  try {
    requireSession(await getSession());
    // Conversations open once a match is accepted; none exist by default.
    return json([]);
  } catch (error) {
    return handleError(error);
  }
}
