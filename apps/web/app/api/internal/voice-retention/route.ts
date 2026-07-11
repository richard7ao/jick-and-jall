import { purgeExpiredSessions, type PurgeDeps } from "@jj/agents";
import { voiceSessionsRepository } from "@jj/db";
import type { NextRequest } from "next/server";

/**
 * Scheduled voice-retention purge. Protected by a cron secret; deletes sessions
 * older than the retention window from Firestore, Storage, and the voice
 * provider. Idempotent and safe to retry.
 */
export const runtime = "nodejs";

export type RetentionDeps = PurgeDeps & {
  isAuthorized: (request: Request) => boolean;
  now: () => string;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function handleRetentionPurge(request: Request, deps: RetentionDeps): Promise<Response> {
  if (!deps.isAuthorized(request)) return json(403, { error: "forbidden" });
  const result = await purgeExpiredSessions(deps, deps.now());
  return json(200, { purged: result.purged.length, failed: result.failed.length });
}

export function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest): Promise<Response> {
  const sessions = voiceSessionsRepository();
  return handleRetentionPurge(request, {
    isAuthorized: cronAuthorized,
    now: () => new Date().toISOString(),
    listOlderThan: (cutoff) => sessions.listOlderThan(cutoff),
    deleteFirestore: (id) => sessions.delete(id),
    // Storage + upstream deletion are wired to their clients in deployment.
    deleteStorage: async () => {},
    deleteUpstream: async () => {},
  });
}
