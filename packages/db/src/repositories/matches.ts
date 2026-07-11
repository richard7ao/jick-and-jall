import { MatchSchema, SCHEMA_VERSION, type Match } from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "matches";

type MatchInput = Omit<
  Match,
  "schemaVersion" | "createdAt" | "updatedAt" | "id" | "disclosureConsented"
>;

export class MatchesRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async create(input: MatchInput): Promise<Match> {
    const now = this.clock.now();
    const match = MatchSchema.parse({
      ...input,
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      disclosureConsented: false,
    });
    await this.store.set(COLLECTION, match.id, match);
    return match;
  }

  async getById(id: string): Promise<Match | null> {
    return this.store.get<Match>(COLLECTION, id);
  }

  async listForBrand(brandUid: string): Promise<Match[]> {
    return this.listBy("brandUid", brandUid);
  }

  async listForCreator(creatorUid: string): Promise<Match[]> {
    return this.listBy("creatorUid", creatorUid);
  }

  private async listBy(field: string, value: string): Promise<Match[]> {
    const rows = await this.store.query<Match>(COLLECTION, {
      where: [{ field, op: "==", value }],
      orderBy: { field: "score", dir: "desc" },
    });
    return rows.map((r) => r.data);
  }

  async setConsent(id: string, consented: boolean): Promise<void> {
    await this.store.update<Match>(COLLECTION, id, {
      disclosureConsented: consented,
      updatedAt: this.clock.now(),
    });
  }
}
