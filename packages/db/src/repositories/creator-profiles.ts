import { type CreatorProfile, CreatorProfileSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

export const CREATOR_PROFILES_COLLECTION = "creatorProfiles";

export function creatorProfilesRepository(db: Firestore = getDb()) {
  const col = db.collection(CREATOR_PROFILES_COLLECTION).withConverter(zodConverter(CreatorProfileSchema));
  return {
    async get(uid: string): Promise<CreatorProfile | null> {
      const snap = await col.doc(uid).get();
      return snap.exists ? (snap.data() as CreatorProfile) : null;
    },
    async upsert(profile: CreatorProfile): Promise<CreatorProfile> {
      const parsed = CreatorProfileSchema.parse(profile);
      await col.doc(parsed.uid).set(parsed);
      return parsed;
    },
    async setPublished(uid: string, published: boolean, updatedAt: string): Promise<void> {
      await col.doc(uid).update({ published, updatedAt });
    },
  };
}
