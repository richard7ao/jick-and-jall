import type { Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { IdSchema, IsoTimestampSchema, MoneyMinorSchema } from "@jj/shared";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Integer-only payment ledger. Entries are keyed by a deterministic id so
 * webhook redelivery is idempotent (create fails on duplicates).
 */
export const TransactionSchema = z
  .object({
    id: IdSchema,
    dealId: IdSchema,
    kind: z.enum(["charge", "payout_intent"]),
    amountMinor: MoneyMinorSchema,
    at: IsoTimestampSchema,
    stripeEventId: z.string().min(1),
  })
  .strict();
export type Transaction = z.infer<typeof TransactionSchema>;

export const TRANSACTIONS_COLLECTION = "transactions";

export function transactionsRepository(db: Firestore = getDb()) {
  const col = db.collection(TRANSACTIONS_COLLECTION).withConverter(zodConverter(TransactionSchema));
  return {
    /** Idempotent append — returns false if this stripe event was already recorded. */
    async record(tx: Transaction): Promise<boolean> {
      const parsed = TransactionSchema.parse(tx);
      const ref = col.doc(parsed.id);
      return db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (snap.exists) return false;
        t.set(ref, parsed);
        return true;
      });
    },
    async listByDeal(dealId: string): Promise<Transaction[]> {
      const snap = await col.where("dealId", "==", dealId).get();
      return snap.docs.map((d) => d.data() as Transaction);
    },
  };
}
