import {
  canTransitionDeal,
  computeBrandCharge,
  DealSchema,
  SCHEMA_VERSION,
  type Deal,
  type DealStatus,
  type Offer,
} from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "deals";

export class DealsRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Create a deal from an accepted offer, computing the fee breakdown once. */
  async createFromOffer(offer: Offer): Promise<Deal> {
    const now = this.clock.now();
    const charge = computeBrandCharge(offer.creatorAmountMinor);
    const deal = DealSchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: newId(),
      offerId: offer.id,
      offerVersion: offer.version,
      status: "mutually_accepted" satisfies DealStatus,
      creatorUid: offer.creatorUid,
      brandUid: offer.brandUid,
      creatorAmountMinor: charge.creatorAmountMinor,
      platformFeeMinor: charge.platformFeeMinor,
      brandChargeMinor: charge.brandChargeMinor,
    });
    await this.store.set(COLLECTION, deal.id, deal);
    return deal;
  }

  async getById(id: string): Promise<Deal | null> {
    return this.store.get<Deal>(COLLECTION, id);
  }

  /** Guarded transition — server authority; rejects illegal state changes. */
  async transition(id: string, to: DealStatus): Promise<Deal> {
    const deal = await this.getById(id);
    if (!deal) throw new Error(`deal/${id} not found`);
    if (!canTransitionDeal(deal.status, to)) {
      throw new Error(`illegal deal transition ${deal.status} -> ${to}`);
    }
    await this.store.update<Deal>(COLLECTION, id, {
      status: to,
      updatedAt: this.clock.now(),
    });
    return { ...deal, status: to };
  }

  async listForUser(uid: string): Promise<Deal[]> {
    const [asCreator, asBrand] = await Promise.all([
      this.store.query<Deal>(COLLECTION, {
        where: [{ field: "creatorUid", op: "==", value: uid }],
      }),
      this.store.query<Deal>(COLLECTION, {
        where: [{ field: "brandUid", op: "==", value: uid }],
      }),
    ]);
    return [...asCreator, ...asBrand].map((r) => r.data);
  }
}
