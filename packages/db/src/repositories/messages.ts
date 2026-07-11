import { MessageSchema, SCHEMA_VERSION, type Message } from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "messages";

export class MessagesRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async add(input: {
    threadId: string;
    senderUid: string;
    body: string;
  }): Promise<Message> {
    const now = this.clock.now();
    const message = MessageSchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      threadId: input.threadId,
      senderUid: input.senderUid,
      body: input.body,
    });
    await this.store.set(COLLECTION, message.id, message);
    return message;
  }

  async listByThread(threadId: string): Promise<Message[]> {
    const rows = await this.store.query<Message>(COLLECTION, {
      where: [{ field: "threadId", op: "==", value: threadId }],
      orderBy: { field: "createdAt", dir: "asc" },
    });
    return rows.map((r) => r.data);
  }
}
