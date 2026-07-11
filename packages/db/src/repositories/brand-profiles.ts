import { type BrandProfile, BrandProfileSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

export const BRAND_PROFILES_COLLECTION = "brandProfiles";

export function brandProfilesRepository(db: Firestore = getDb()) {
  const col = db.collection(BRAND_PROFILES_COLLECTION).withConverter(zodConverter(BrandProfileSchema));
  return {
    async get(uid: string): Promise<BrandProfile | null> {
      const snap = await col.doc(uid).get();
      return snap.exists ? (snap.data() as BrandProfile) : null;
    },
    async upsert(profile: BrandProfile): Promise<BrandProfile> {
      const parsed = BrandProfileSchema.parse(profile);
      await col.doc(parsed.uid).set(parsed);
      return parsed;
    },
  };
}
