import { applyDealTransition } from "@jj/agents";
import { type Deal, DealSchema, type DealStatus } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Deals with an append-only status trail. Each transition is validated by the
 * TypeScript state machine inside a Firestore transaction and recorded as an
 * immutable event under the deal.
 */
export const DEALS_COLLECTION = "deals";
export const DEAL_EVENTS_SUBCOLLECTION = "events";

export function dealsRepository(db: Firestore = getDb()) {
  const col = db.collection(DEALS_COLLECTION).withConverter(zodConverter(DealSchema));

  return {
    async create(deal: Deal): Promise<Deal> {
      const parsed = DealSchema.parse(deal);
      await col.doc(parsed.id).create(parsed);
      await col.doc(parsed.id).collection(DEAL_EVENTS_SUBCOLLECTION).add({ status: parsed.status, at: parsed.createdAt });
      return parsed;
    },

    async get(id: string): Promise<Deal | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as Deal) : null;
    },

    async transition(id: string, to: DealStatus, now: string): Promise<Deal> {
      const ref = col.doc(id);
      const next = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error("deal not found");
        const updated = applyDealTransition(snap.data() as Deal, to, now); // throws on illegal
        tx.set(ref, updated);
        return updated;
      });
      // Append-only event trail (outside the txn is fine; status already applied).
      await ref.collection(DEAL_EVENTS_SUBCOLLECTION).add({ status: to, at: now });
      return next;
    },
  };
}
