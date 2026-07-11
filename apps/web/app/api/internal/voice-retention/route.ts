import { purgeExpiredSessions, type PurgeDeps } from "@jj/agents";
import { recordingPath } from "@jj/auth";
import { voiceSessionsRepository } from "@jj/db";
import type { VoiceSession } from "@jj/shared";
import { createElevenLabsClient, ProviderError } from "@jj/voice";
import { getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
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

/** Minimal storage boundary: deletes an object by its owner-scoped path. */
export type RecordingStore = { delete: (path: string) => Promise<void> };
/** Minimal voice-provider boundary: deletes an upstream conversation by id. */
export type ConversationStore = { delete: (conversationId: string) => Promise<void> };

/**
 * Deletes the owner-scoped recording for a session. Sessions without a stored
 * recording (e.g. the text fallback) have nothing to delete.
 */
export function makeStorageDeleter(store: RecordingStore): (session: VoiceSession) => Promise<void> {
  return async (session) => {
    if (!session.recordingStored) return;
    await store.delete(recordingPath(session.uid, session.id));
  };
}

/**
 * Deletes the upstream voice-provider conversation so retention propagates. The
 * session id doubles as the ElevenLabs conversation id. A conversation that is
 * already gone (404) is treated as success, keeping the purge idempotent.
 */
export function makeUpstreamDeleter(store: ConversationStore): (session: VoiceSession) => Promise<void> {
  return async (session) => {
    try {
      await store.delete(session.id);
    } catch (error) {
      if (error instanceof ProviderError && error.status === 404) return;
      throw error;
    }
  };
}

function storageBucket() {
  const app = getApps()[0] ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "demo-jj" });
  return getStorage(app).bucket(process.env.FIREBASE_STORAGE_BUCKET ?? "demo-jj.appspot.com");
}

export async function POST(request: NextRequest): Promise<Response> {
  const sessions = voiceSessionsRepository();
  const bucket = storageBucket();
  const voice = createElevenLabsClient({
    baseUrl: process.env.ELEVENLABS_BASE_URL ?? "https://api.elevenlabs.io",
    apiKey: process.env.ELEVENLABS_API_KEY ?? "",
  });
  return handleRetentionPurge(request, {
    isAuthorized: cronAuthorized,
    now: () => new Date().toISOString(),
    listOlderThan: (cutoff) => sessions.listOlderThan(cutoff),
    deleteFirestore: (id) => sessions.delete(id),
    deleteStorage: makeStorageDeleter({
      delete: async (path) => {
        await bucket.file(path).delete({ ignoreNotFound: true });
      },
    }),
    deleteUpstream: makeUpstreamDeleter({
      delete: async (id) => {
        await voice.deleteConversation(id);
      },
    }),
  });
}
