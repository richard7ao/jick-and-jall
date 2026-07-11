import { type Campaign, CampaignSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

export const CAMPAIGNS_COLLECTION = "campaigns";

export function campaignsRepository(db: Firestore = getDb()) {
  const col = db.collection(CAMPAIGNS_COLLECTION).withConverter(zodConverter(CampaignSchema));
  return {
    async create(campaign: Campaign): Promise<Campaign> {
      const parsed = CampaignSchema.parse(campaign);
      await col.doc(parsed.id).create(parsed);
      return parsed;
    },
    async get(id: string): Promise<Campaign | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as Campaign) : null;
    },
    async listByBrand(brandUid: string): Promise<Campaign[]> {
      const snap = await col.where("brandUid", "==", brandUid).get();
      return snap.docs.map((d) => d.data() as Campaign);
    },
    async setStatus(id: string, status: Campaign["status"], updatedAt: string): Promise<void> {
      await col.doc(id).update({ status, updatedAt });
    },
  };
}
