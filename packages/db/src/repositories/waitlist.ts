import {
  SCHEMA_VERSION,
  WaitlistEntrySchema,
  WaitlistSubmissionSchema,
  type WaitlistEntry,
  type WaitlistSubmission,
} from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "waitlist";

export class WaitlistRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async add(submission: WaitlistSubmission): Promise<WaitlistEntry> {
    const parsed = WaitlistSubmissionSchema.parse(submission);
    const now = this.clock.now();
    const entry = WaitlistEntrySchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      role: parsed.role,
      email: parsed.email,
      locale: parsed.locale,
      consent: parsed.consent,
      status: "pending",
      ...(parsed.qualification ? { qualification: parsed.qualification } : {}),
    });
    await this.store.set(COLLECTION, entry.id, entry);
    return entry;
  }

  async getByEmail(email: string): Promise<WaitlistEntry | null> {
    const [row] = await this.store.query<WaitlistEntry>(COLLECTION, {
      where: [{ field: "email", op: "==", value: email }],
      limit: 1,
    });
    return row?.data ?? null;
  }

  async setStatus(
    id: string,
    status: WaitlistEntry["status"],
  ): Promise<void> {
    await this.store.update<WaitlistEntry>(COLLECTION, id, {
      status,
      updatedAt: this.clock.now(),
    });
  }

  async list(): Promise<WaitlistEntry[]> {
    const rows = await this.store.query<WaitlistEntry>(COLLECTION, {
      orderBy: { field: "createdAt", dir: "asc" },
    });
    return rows.map((r) => r.data);
  }
}
