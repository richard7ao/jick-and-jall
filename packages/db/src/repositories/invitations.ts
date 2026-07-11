import { type Invitation, InvitationSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Invitations repository. Invitations are single-use and time-limited;
 * `consume` atomically rejects an already-consumed or expired invitation so a
 * link cannot be replayed.
 */
export const INVITATIONS_COLLECTION = "invitations";

export function invitationsRepository(db: Firestore = getDb()) {
  const col = db.collection(INVITATIONS_COLLECTION).withConverter(zodConverter(InvitationSchema));

  return {
    async create(invitation: Invitation): Promise<Invitation> {
      const parsed = InvitationSchema.parse(invitation);
      await col.doc(parsed.id).create(parsed);
      return parsed;
    },

    async get(id: string): Promise<Invitation | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as Invitation) : null;
    },

    /** Atomically mark an invitation consumed; throws if invalid/expired/used. */
    async consume(id: string, at: string): Promise<Invitation> {
      const ref = col.doc(id);
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error("invitation not found");
        const invitation = snap.data() as Invitation;
        if (invitation.consumedAt) throw new Error("invitation already used");
        if (Date.parse(invitation.expiresAt) <= Date.parse(at)) throw new Error("invitation expired");
        tx.update(ref, { consumedAt: at, updatedAt: at });
        return { ...invitation, consumedAt: at, updatedAt: at };
      });
    },
  };
}
