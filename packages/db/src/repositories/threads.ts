import type { Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { IdSchema, IsoTimestampSchema, MessageSchema, SchemaVersionSchema, UidSchema, type Message } from "@jj/shared";
import { zodConverter } from "../converter.js";
import { getDb } from "../firestore.js";

/**
 * Conversation threads open only between a brand and a creator whose match was
 * consented. Both repositories enforce participant authorization at the query
 * level; route handlers add principal checks.
 */
export const ThreadSchema = z
  .object({
    schemaVersion: SchemaVersionSchema,
    createdAt: IsoTimestampSchema,
    updatedAt: IsoTimestampSchema,
    id: IdSchema,
    matchId: IdSchema,
    brandUid: UidSchema,
    creatorUid: UidSchema,
  })
  .strict();
export type Thread = z.infer<typeof ThreadSchema>;

export const THREADS_COLLECTION = "threads";
export const MESSAGES_COLLECTION = "messages";

export function isThreadParticipant(thread: Thread, uid: string): boolean {
  return thread.brandUid === uid || thread.creatorUid === uid;
}

export function threadsRepository(db: Firestore = getDb()) {
  const col = db.collection(THREADS_COLLECTION).withConverter(zodConverter(ThreadSchema));
  return {
    async upsert(thread: Thread): Promise<Thread> {
      const parsed = ThreadSchema.parse(thread);
      await col.doc(parsed.id).set(parsed);
      return parsed;
    },
    async get(id: string): Promise<Thread | null> {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as Thread) : null;
    },
    async listForUser(uid: string): Promise<Thread[]> {
      const [asBrand, asCreator] = await Promise.all([
        col.where("brandUid", "==", uid).get(),
        col.where("creatorUid", "==", uid).get(),
      ]);
      return [...asBrand.docs, ...asCreator.docs].map((d) => d.data() as Thread);
    },
  };
}

export function messagesRepository(db: Firestore = getDb()) {
  const col = db.collection(MESSAGES_COLLECTION).withConverter(zodConverter(MessageSchema));
  return {
    async append(message: Message): Promise<Message> {
      const parsed = MessageSchema.parse(message);
      await col.doc(parsed.id).create(parsed);
      return parsed;
    },
    async listByThread(threadId: string): Promise<Message[]> {
      const snap = await col.where("threadId", "==", threadId).get();
      return snap.docs
        .map((d) => d.data() as Message)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
}
