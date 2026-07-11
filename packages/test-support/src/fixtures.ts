/**
 * Deterministic fixtures for tests. All timestamps are fixed so snapshots and
 * assertions are stable.
 */

import {
  CONSENT_POLICY_VERSION,
  SCHEMA_VERSION,
  type CreatorProfile,
  type UserRecord,
  type WaitlistSubmission,
} from "@jj/shared";

export const FIXED_NOW = "2026-07-11T00:00:00.000Z";

export function creatorUserFixture(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    uid: "creator-1",
    email: "creator@example.com",
    role: "creator",
    locale: "en",
    ...overrides,
  };
}

export function creatorProfileFixture(overrides: Partial<CreatorProfile> = {}): CreatorProfile {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    uid: "creator-1",
    locale: "en",
    displayName: "Ari Traveler",
    bio: "Travel + food creator.",
    niches: ["travel", "food"],
    platforms: ["instagram"],
    published: true,
    available: true,
    ...overrides,
  };
}

export function waitlistSubmissionFixture(overrides: Partial<WaitlistSubmission> = {}): WaitlistSubmission {
  return {
    role: "creator",
    email: "waitlist@example.com",
    locale: "en",
    consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
    ...overrides,
  };
}
