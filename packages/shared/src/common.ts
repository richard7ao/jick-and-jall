import { z } from "zod";

/**
 * Shared primitive contracts. Every stored record carries a `schemaVersion`,
 * timestamps are ISO-8601 strings, and all money is GBP in integer minor units
 * (pence). Financial shapes never accept card or bank fields.
 */

export const SCHEMA_VERSION = 1 as const;
export const CONSENT_POLICY_VERSION = "2026-07-11" as const;

export const LocaleSchema = z.enum(["en", "es"]);
export type Locale = z.infer<typeof LocaleSchema>;

/** Roles are immutable per account; a person wanting both creates two accounts. */
export const RoleSchema = z.enum(["creator", "brand"]);
export type Role = z.infer<typeof RoleSchema>;

export const UidSchema = z.string().min(1).max(128);
export const IdSchema = z.string().min(1).max(128);
export const IsoTimestampSchema = z.string().datetime({ offset: true });

export const SchemaVersionSchema = z.literal(SCHEMA_VERSION);

/** GBP amount in integer minor units (pence). Never negative, always integer. */
export const MoneyMinorSchema = z.number().int().nonnegative();
export type MoneyMinor = z.infer<typeof MoneyMinorSchema>;

export const CurrencySchema = z.literal("GBP");

export const MoneySchema = z
  .object({
    currency: CurrencySchema,
    amountMinor: MoneyMinorSchema,
  })
  .strict();
export type Money = z.infer<typeof MoneySchema>;

/** Explicit, versioned consent. `accepted` must be literally true. */
export const ConsentSchema = z
  .object({
    accepted: z.literal(true),
    policyVersion: z.literal(CONSENT_POLICY_VERSION),
  })
  .strict();
export type Consent = z.infer<typeof ConsentSchema>;

/** Fields shared by every stored record. */
export const StoredRecordShape = {
  schemaVersion: SchemaVersionSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
} as const;
