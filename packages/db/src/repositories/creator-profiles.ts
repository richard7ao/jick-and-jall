import {
  CreatorProfileSchema,
  isRankableCreator,
  SCHEMA_VERSION,
  type CreatorProfile,
} from "@jj/shared";

import { systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "creatorProfiles";

type CreatorProfileInput = Omit<
  CreatorProfile,
  "schemaVersion" | "createdAt" | "updatedAt"
>;

export class CreatorProfilesRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async upsert(input: CreatorProfileInput): Promise<CreatorProfile> {
    const now = this.clock.now();
    const existing = await this.getByUid(input.uid);
    const profile = CreatorProfileSchema.parse({
      ...input,
      schemaVersion: SCHEMA_VERSION,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    await this.store.set(COLLECTION, profile.uid, profile);
    return profile;
  }

  async getByUid(uid: string): Promise<CreatorProfile | null> {
    return this.store.get<CreatorProfile>(COLLECTION, uid);
  }

  /** Only registered, published, available creators are eligible for ranking. */
  async listRankable(): Promise<CreatorProfile[]> {
    const rows = await this.store.query<CreatorProfile>(COLLECTION, {
      where: [
        { field: "published", op: "==", value: true },
        { field: "available", op: "==", value: true },
      ],
    });
    return rows.map((r) => r.data).filter(isRankableCreator);
  }
}
