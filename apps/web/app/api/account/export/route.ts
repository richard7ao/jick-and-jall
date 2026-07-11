import { requireSession } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";

export async function POST(): Promise<Response> {
  try {
    requireSession(await getSession());
    // Export is queued asynchronously; a neutral acknowledgement is returned.
    return json({ status: "started" }, 202);
  } catch (error) {
    return handleError(error);
  }
}
