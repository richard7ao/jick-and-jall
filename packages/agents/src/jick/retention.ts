import type { VoiceSession } from "@jj/shared";

/**
 * Voice recording retention. Sessions older than the retention window are purged
 * from Firestore, Storage, and the upstream voice provider. The purge is
 * idempotent and durable: a failure on one session never blocks others and
 * never extends a successful deletion; failures are reported for retry.
 */
export const DEFAULT_RETENTION_DAYS = 90;

export function retentionCutoffIso(nowIso: string, retentionDays = DEFAULT_RETENTION_DAYS): string {
  return new Date(Date.parse(nowIso) - retentionDays * 86_400_000).toISOString();
}

export function selectExpiredSessions(
  sessions: readonly VoiceSession[],
  nowIso: string,
  retentionDays = DEFAULT_RETENTION_DAYS,
): VoiceSession[] {
  const cutoff = Date.parse(retentionCutoffIso(nowIso, retentionDays));
  return sessions.filter((s) => Date.parse(s.createdAt) < cutoff);
}

export type PurgeDeps = {
  listOlderThan: (cutoffIso: string) => Promise<VoiceSession[]>;
  deleteFirestore: (id: string) => Promise<void>;
  deleteStorage: (session: VoiceSession) => Promise<void>;
  deleteUpstream: (session: VoiceSession) => Promise<void>;
};

export async function purgeExpiredSessions(
  deps: PurgeDeps,
  nowIso: string,
  retentionDays = DEFAULT_RETENTION_DAYS,
): Promise<{ purged: string[]; failed: string[] }> {
  const cutoff = retentionCutoffIso(nowIso, retentionDays);
  const expired = await deps.listOlderThan(cutoff);
  const purged: string[] = [];
  const failed: string[] = [];

  for (const session of expired) {
    try {
      // Delete upstream + storage before the Firestore record, so a failure
      // leaves a durable record to retry rather than an orphaned recording.
      await deps.deleteUpstream(session);
      await deps.deleteStorage(session);
      await deps.deleteFirestore(session.id);
      purged.push(session.id);
    } catch {
      failed.push(session.id);
    }
  }
  return { purged, failed };
}
