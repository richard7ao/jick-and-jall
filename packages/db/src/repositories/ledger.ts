import { z } from "zod";

import {
  IdSchema,
  IsoTimestampSchema,
  MoneyMinorSchema,
  SCHEMA_VERSION,
  SchemaVersionSchema,
} from "@jj/shared";

import { newId, systemClock, type Clock } from "../ids.js";
import type { DocumentStore } from "../store.js";

const COLLECTION = "ledger";

/** Append-only financial ledger. Entries are never mutated or deleted. */
export const LedgerEntrySchema = z
  .object({
    schemaVersion: SchemaVersionSchema,
    createdAt: IsoTimestampSchema,
    id: IdSchema,
    dealId: IdSchema,
    kind: z.enum(["charge", "payout", "refund", "reversal"]),
    amountMinor: MoneyMinorSchema,
    currency: z.literal("GBP"),
    // External reference (e.g. Stripe object id); redact before logging.
    reference: z.string().min(1),
  })
  .strict();
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

export class LedgerRepository {
  constructor(
    private readonly store: DocumentStore,
    private readonly clock: Clock = systemClock,
  ) {}

  async append(input: {
    dealId: string;
    kind: LedgerEntry["kind"];
    amountMinor: number;
    reference: string;
  }): Promise<LedgerEntry> {
    const entry = LedgerEntrySchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: this.clock.now(),
      id: newId(),
      dealId: input.dealId,
      kind: input.kind,
      amountMinor: input.amountMinor,
      currency: "GBP",
      reference: input.reference,
    });
    await this.store.set(COLLECTION, entry.id, entry);
    return entry;
  }

  async listByDeal(dealId: string): Promise<LedgerEntry[]> {
    const rows = await this.store.query<LedgerEntry>(COLLECTION, {
      where: [{ field: "dealId", op: "==", value: dealId }],
      orderBy: { field: "createdAt", dir: "asc" },
    });
    return rows.map((r) => r.data);
  }

  /** Idempotency guard: has an entry with this external reference been recorded? */
  async hasReference(reference: string): Promise<boolean> {
    const [row] = await this.store.query<LedgerEntry>(COLLECTION, {
      where: [{ field: "reference", op: "==", value: reference }],
      limit: 1,
    });
    return row !== undefined;
  }
}
