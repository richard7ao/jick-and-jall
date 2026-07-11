import { CampaignSchema, SCHEMA_VERSION, type Campaign } from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "campaigns";

type CampaignInput = Omit<
  Campaign,
  "schemaVersion" | "createdAt" | "updatedAt" | "id" | "status"
>;

export class CampaignsRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async create(input: CampaignInput): Promise<Campaign> {
    const now = this.clock.now();
    const campaign = CampaignSchema.parse({
      ...input,
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      status: "draft",
    });
    await this.store.set(COLLECTION, campaign.id, campaign);
    return campaign;
  }

  async getById(id: string): Promise<Campaign | null> {
    return this.store.get<Campaign>(COLLECTION, id);
  }

  async setStatus(id: string, status: Campaign["status"]): Promise<void> {
    await this.store.update<Campaign>(COLLECTION, id, {
      status,
      updatedAt: this.clock.now(),
    });
  }

  async listByBrand(brandUid: string): Promise<Campaign[]> {
    const rows = await this.store.query<Campaign>(COLLECTION, {
      where: [{ field: "brandUid", op: "==", value: brandUid }],
    });
    return rows.map((r) => r.data);
  }

  async listPublished(): Promise<Campaign[]> {
    const rows = await this.store.query<Campaign>(COLLECTION, {
      where: [{ field: "status", op: "==", value: "published" }],
    });
    return rows.map((r) => r.data);
  }
}
