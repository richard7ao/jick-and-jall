import { OfferSchema, SCHEMA_VERSION, type Offer } from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "offers";

type OfferInput = Omit<
  Offer,
  "schemaVersion" | "createdAt" | "updatedAt" | "id" | "version"
>;

export class OffersRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Append-only: each call creates the next version, never mutates prior ones. */
  async appendVersion(input: OfferInput): Promise<Offer> {
    const existing = await this.listFor(input.campaignId, input.creatorUid);
    const version = (existing.at(-1)?.version ?? 0) + 1;
    const now = this.clock.now();
    const offer = OfferSchema.parse({
      ...input,
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      version,
    });
    await this.store.set(COLLECTION, offer.id, offer);
    return offer;
  }

  async listFor(campaignId: string, creatorUid: string): Promise<Offer[]> {
    const rows = await this.store.query<Offer>(COLLECTION, {
      where: [
        { field: "campaignId", op: "==", value: campaignId },
        { field: "creatorUid", op: "==", value: creatorUid },
      ],
      orderBy: { field: "version", dir: "asc" },
    });
    return rows.map((r) => r.data);
  }

  async latestFor(
    campaignId: string,
    creatorUid: string,
  ): Promise<Offer | null> {
    const all = await this.listFor(campaignId, creatorUid);
    return all.at(-1) ?? null;
  }
}
