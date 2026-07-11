import { type TranscriptTurn, type VoiceSession, VoiceSessionSchema } from "@jj/shared";
import type { Firestore } from "firebase-admin/firestore";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

export const VOICE_SESSIONS_COLLECTION = "voiceSessions";

export function voiceSessionsRepository(db: Firestore = getDb()) {
  const col = db.collection(VOICE_SESSIONS_COLLECTION).withConverter(zodConverter(VoiceSessionSchema));
  return {
    async create(session: VoiceSession): Promise<VoiceSession> {
      const parsed = VoiceSessionSchema.parse(session);
      await col.doc(parsed.id).create(parsed);
      return parsed;
    },
    async get(id: string): Promise<VoiceSession | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as VoiceSession) : null;
    },
    async complete(id: string, transcript: TranscriptTurn[], recordingStored: boolean, updatedAt: string): Promise<void> {
      await col.doc(id).update({ status: "completed", transcript, recordingStored, updatedAt });
    },
    async listOlderThan(cutoffIso: string): Promise<VoiceSession[]> {
      const snap = await col.where("createdAt", "<", cutoffIso).get();
      return snap.docs.map((d) => d.data() as VoiceSession);
    },
    async delete(id: string): Promise<void> {
      await col.doc(id).delete();
    },
  };
}
