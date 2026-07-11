import {
  BrandProfileSchema,
  SCHEMA_VERSION,
  type BrandProfile,
} from "@jj/shared";

import { systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "brandProfiles";

type BrandProfileInput = Omit<
  BrandProfile,
  "schemaVersion" | "createdAt" | "updatedAt"
>;

export class BrandProfilesRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async upsert(input: BrandProfileInput): Promise<BrandProfile> {
    const now = this.clock.now();
    const existing = await this.getByUid(input.uid);
    const profile = BrandProfileSchema.parse({
      ...input,
      schemaVersion: SCHEMA_VERSION,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    await this.store.set(COLLECTION, profile.uid, profile);
    return profile;
  }

  async getByUid(uid: string): Promise<BrandProfile | null> {
    return this.store.get<BrandProfile>(COLLECTION, uid);
  }
}
