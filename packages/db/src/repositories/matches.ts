import { type Match, MatchSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

export const MATCHES_COLLECTION = "matches";

export function matchesRepository(db: Firestore = getDb()) {
  const col = db.collection(MATCHES_COLLECTION).withConverter(zodConverter(MatchSchema));
  return {
    async upsert(match: Match): Promise<Match> {
      const parsed = MatchSchema.parse(match);
      await col.doc(parsed.id).set(parsed);
      return parsed;
    },
    async get(id: string): Promise<Match | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as Match) : null;
    },
    async listByCampaign(campaignId: string): Promise<Match[]> {
      const snap = await col.where("campaignId", "==", campaignId).get();
      return snap.docs.map((d) => d.data() as Match);
    },
    async listByCreator(creatorUid: string): Promise<Match[]> {
      const snap = await col.where("creatorUid", "==", creatorUid).get();
      return snap.docs.map((d) => d.data() as Match);
    },
    async setConsent(id: string, disclosureConsented: boolean, updatedAt: string): Promise<void> {
      await col.doc(id).update({ disclosureConsented, updatedAt });
    },
  };
}
