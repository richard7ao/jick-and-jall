import {
  SCHEMA_VERSION,
  VoiceSessionSchema,
  type Locale,
  type TranscriptTurn,
  type VoiceSession,
} from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "voiceSessions";

export class VoiceSessionsRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async create(input: {
    uid: string;
    locale: Locale;
    consentVersion: string;
  }): Promise<VoiceSession> {
    const now = this.clock.now();
    const session = VoiceSessionSchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      uid: input.uid,
      locale: input.locale,
      consentVersion: input.consentVersion,
      status: "active",
      transcript: [],
      recordingStored: false,
      retentionDays: 90,
    });
    await this.store.set(COLLECTION, session.id, session);
    return session;
  }

  async getById(id: string): Promise<VoiceSession | null> {
    return this.store.get<VoiceSession>(COLLECTION, id);
  }

  async appendTurn(id: string, turn: TranscriptTurn): Promise<void> {
    const session = await this.getById(id);
    if (!session) throw new Error(`voiceSession/${id} not found`);
    await this.store.update<VoiceSession>(COLLECTION, id, {
      transcript: [...session.transcript, turn],
      updatedAt: this.clock.now(),
    });
  }

  async complete(id: string, recordingStored: boolean): Promise<void> {
    await this.store.update<VoiceSession>(COLLECTION, id, {
      status: "completed",
      recordingStored,
      updatedAt: this.clock.now(),
    });
  }

  async listByUid(uid: string): Promise<VoiceSession[]> {
    const rows = await this.store.query<VoiceSession>(COLLECTION, {
      where: [{ field: "uid", op: "==", value: uid }],
      orderBy: { field: "createdAt", dir: "desc" },
    });
    return rows.map((r) => r.data);
  }

  async remove(id: string): Promise<void> {
    await this.store.remove(COLLECTION, id);
  }

  /** Idempotent retention purge: returns the ids of sessions deleted. */
  async purgeExpired(nowMs: number = Date.parse(this.clock.now())): Promise<string[]> {
    const rows = await this.store.query<VoiceSession>(COLLECTION, {});
    const expired = rows.filter(({ data }) => {
      const ageMs = nowMs - Date.parse(data.createdAt);
      return ageMs > data.retentionDays * 24 * 60 * 60 * 1000;
    });
    for (const { id } of expired) await this.store.remove(COLLECTION, id);
    return expired.map((r) => r.id);
  }
}
