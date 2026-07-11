import { type WaitlistEntry, WaitlistEntrySchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Waitlist repository. Submission is idempotent: the entry id is derived from
 * the caller's idempotency key, so a retried submission returns the existing
 * entry rather than creating a duplicate.
 */
export const WAITLIST_COLLECTION = "waitlist";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function waitlistRepository(db: Firestore = getDb()) {
  const col = db.collection(WAITLIST_COLLECTION).withConverter(zodConverter(WaitlistEntrySchema));

  return {
    async submit(entry: WaitlistEntry): Promise<{ entryId: string; created: boolean }> {
      const parsed = WaitlistEntrySchema.parse({ ...entry, email: normalizeEmail(entry.email) });
      const ref = col.doc(parsed.id);
      const created = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) return false;
        tx.set(ref, parsed);
        return true;
      });
      return { entryId: parsed.id, created };
    },

    async get(id: string): Promise<WaitlistEntry | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as WaitlistEntry) : null;
    },

    async setStatus(id: string, status: WaitlistEntry["status"], updatedAt: string): Promise<void> {
      await col.doc(id).update({ status, updatedAt });
    },
  };
}
