import { type Locale, type UserRecord, UserRecordSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Users repository. Roles are immutable: there is no method to change a role,
 * and `create` fails if the document already exists. Locale is the only
 * mutable field here.
 */
export const USERS_COLLECTION = "users";

export function usersRepository(db: Firestore = getDb()) {
  const col = db.collection(USERS_COLLECTION).withConverter(zodConverter(UserRecordSchema));

  return {
    async create(user: UserRecord): Promise<UserRecord> {
      const parsed = UserRecordSchema.parse(user);
      // `create` throws if the document already exists — one identity per uid.
      await col.doc(parsed.uid).create(parsed);
      return parsed;
    },

    async get(uid: string): Promise<UserRecord | null> {
      const snap = await col.doc(uid).get();
      return snap.exists ? (snap.data() as UserRecord) : null;
    },

    async setLocale(uid: string, locale: Locale, updatedAt: string): Promise<void> {
      // Never touches `role`; role immutability is preserved by construction.
      await col.doc(uid).update({ locale, updatedAt });
    },
  };
}
