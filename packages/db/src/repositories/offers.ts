import { type Offer, OfferSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Versioned offers. Terms are never mutated in place: each change is a new
 * version document, so the history of proposed terms is preserved.
 */
export const OFFERS_COLLECTION = "offers";

export function offerDocId(campaignId: string, creatorUid: string, version: number): string {
  return `${campaignId}__${creatorUid}__v${version}`;
}

export function offersRepository(db: Firestore = getDb()) {
  const col = db.collection(OFFERS_COLLECTION).withConverter(zodConverter(OfferSchema));
  return {
    async create(offer: Offer): Promise<Offer> {
      const parsed = OfferSchema.parse(offer);
      await col.doc(offerDocId(parsed.campaignId, parsed.creatorUid, parsed.version)).create(parsed);
      return parsed;
    },
    async latest(campaignId: string, creatorUid: string): Promise<Offer | null> {
      const snap = await col
        .where("campaignId", "==", campaignId)
        .where("creatorUid", "==", creatorUid)
        .get();
      const offers = snap.docs.map((d) => d.data() as Offer).sort((a, b) => b.version - a.version);
      return offers[0] ?? null;
    },
  };
}
