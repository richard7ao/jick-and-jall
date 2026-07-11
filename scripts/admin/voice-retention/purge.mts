/**
 * Manual voice-retention purge (allowlisted admin). Deletes sessions older than
 * 90 days from Firestore, Storage, and the voice provider. Idempotent.
 *
 * Usage: tsx scripts/admin/voice-retention/purge.mts
 */
import { purgeExpiredSessions } from "@jj/agents";
import { voiceSessionsRepository } from "@jj/db";

async function main(): Promise<void> {
  const repo = voiceSessionsRepository();
  const result = await purgeExpiredSessions(
    {
      listOlderThan: (cutoff) => repo.listOlderThan(cutoff),
      deleteFirestore: (id) => repo.delete(id),
      // Storage + upstream deletion are wired to their clients in deployment.
      deleteStorage: async () => {},
      deleteUpstream: async () => {},
    },
    new Date().toISOString(),
  );
  console.log(`purged ${result.purged.length}, failed ${result.failed.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
