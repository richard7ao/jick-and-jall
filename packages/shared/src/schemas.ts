import { z } from "zod";

import {
  ConsentSchema,
  IdSchema,
  IsoTimestampSchema,
  LocaleSchema,
  MoneyMinorSchema,
  RoleSchema,
  StoredRecordShape,
  UidSchema,
} from "./common.js";
import { DealStatusSchema } from "./deal-state.js";

/**
 * Versioned Zod contracts for every v1 record. All are `.strict()` so unknown
 * fields are rejected at the boundary. Only registered, published, available
 * creators may be ranked (see CreatorProfileSchema).
 */

const EmailSchema = z.string().email().max(320);

// --- Waitlist & invitations -------------------------------------------------

export const WaitlistSubmissionSchema = z
  .object({
    role: RoleSchema,
    email: EmailSchema,
    locale: LocaleSchema,
    consent: ConsentSchema,
    qualification: z
      .record(z.union([z.string(), z.number(), z.array(z.string()).readonly()]))
      .optional(),
  })
  .strict();
export type WaitlistSubmission = z.infer<typeof WaitlistSubmissionSchema>;

export const WaitlistEntrySchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    role: RoleSchema,
    email: EmailSchema,
    locale: LocaleSchema,
    consent: ConsentSchema,
    status: z.enum(["pending", "approved", "rejected"]),
    qualification: z.record(z.unknown()).optional(),
  })
  .strict();
export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

export const InvitationSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    email: EmailSchema,
    role: RoleSchema,
    expiresAt: IsoTimestampSchema,
    consumedAt: IsoTimestampSchema.nullable(),
  })
  .strict();
export type Invitation = z.infer<typeof InvitationSchema>;

// --- Identity ---------------------------------------------------------------

export const UserRecordSchema = z
  .object({
    ...StoredRecordShape,
    uid: UidSchema,
    email: EmailSchema,
    // Role is immutable once created; enforced by rules and repositories.
    role: RoleSchema,
    locale: LocaleSchema,
  })
  .strict();
export type UserRecord = z.infer<typeof UserRecordSchema>;

// --- Creator (Jick) ---------------------------------------------------------

export const CreatorProfileSchema = z
  .object({
    ...StoredRecordShape,
    uid: UidSchema,
    locale: LocaleSchema,
    displayName: z.string().min(1).max(120),
    bio: z.string().max(2000).default(""),
    niches: z.array(z.string().min(1)).max(20).default([]),
    platforms: z.array(z.string().min(1)).max(20).default([]),
    // Only registered + published + available creators are eligible for ranking.
    published: z.boolean(),
    available: z.boolean(),
    minBudgetMinor: MoneyMinorSchema.optional(),
  })
  .strict();
export type CreatorProfile = z.infer<typeof CreatorProfileSchema>;

/** A creator is rankable only when registered, published, and available. */
export function isRankableCreator(profile: Pick<CreatorProfile, "published" | "available">): boolean {
  return profile.published && profile.available;
}

// --- Brand (Jall) -----------------------------------------------------------

export const BrandProfileSchema = z
  .object({
    ...StoredRecordShape,
    uid: UidSchema,
    locale: LocaleSchema,
    companyName: z.string().min(1).max(160),
    website: z.string().url().max(500).optional(),
    about: z.string().max(2000).default(""),
  })
  .strict();
export type BrandProfile = z.infer<typeof BrandProfileSchema>;

export const CampaignSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    brandUid: UidSchema,
    locale: LocaleSchema,
    title: z.string().min(1).max(160),
    brief: z.string().max(4000).default(""),
    budgetMinor: MoneyMinorSchema,
    status: z.enum(["draft", "published", "closed"]),
  })
  .strict();
export type Campaign = z.infer<typeof CampaignSchema>;

// --- Matching ---------------------------------------------------------------

export const MatchSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    campaignId: IdSchema,
    creatorUid: UidSchema,
    brandUid: UidSchema,
    // Deterministic rank score, computed by TypeScript from provider signals.
    score: z.number().min(0).max(1),
    // Contact details stay hidden until the creator consents.
    disclosureConsented: z.boolean(),
  })
  .strict();
export type Match = z.infer<typeof MatchSchema>;

// --- Voice (Jick onboarding) ------------------------------------------------

export const TranscriptTurnSchema = z
  .object({
    role: z.enum(["agent", "user"]),
    text: z.string(),
    at: IsoTimestampSchema,
  })
  .strict();
export type TranscriptTurn = z.infer<typeof TranscriptTurnSchema>;

export const VoiceSessionSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    uid: UidSchema,
    locale: LocaleSchema,
    consentVersion: z.string().min(1),
    status: z.enum(["active", "completed", "failed"]),
    transcript: z.array(TranscriptTurnSchema).default([]),
    recordingStored: z.boolean().default(false),
    // Recordings default to 90-day retention; deletion propagates upstream.
    retentionDays: z.number().int().positive().default(90),
  })
  .strict();
export type VoiceSession = z.infer<typeof VoiceSessionSchema>;

// --- Offers, deals, messages ------------------------------------------------

export const OfferSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    // Terms are versioned; each change is a new version, never a mutation.
    version: z.number().int().positive(),
    campaignId: IdSchema,
    creatorUid: UidSchema,
    brandUid: UidSchema,
    creatorAmountMinor: MoneyMinorSchema,
    deliverable: z.string().min(1).max(2000),
  })
  .strict();
export type Offer = z.infer<typeof OfferSchema>;

export const DealSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    offerId: IdSchema,
    offerVersion: z.number().int().positive(),
    status: DealStatusSchema,
    creatorUid: UidSchema,
    brandUid: UidSchema,
    creatorAmountMinor: MoneyMinorSchema,
    platformFeeMinor: MoneyMinorSchema,
    brandChargeMinor: MoneyMinorSchema,
  })
  .strict();
export type Deal = z.infer<typeof DealSchema>;

export const MessageSchema = z
  .object({
    ...StoredRecordShape,
    id: IdSchema,
    threadId: IdSchema,
    senderUid: UidSchema,
    body: z.string().min(1).max(4000),
  })
  .strict();
export type Message = z.infer<typeof MessageSchema>;
