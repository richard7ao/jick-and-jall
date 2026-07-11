import { describe, expect, it } from "vitest";
import {
  CONSENT_POLICY_VERSION,
  CreatorProfileSchema,
  DealSchema,
  isRankableCreator,
  MoneySchema,
  SCHEMA_VERSION,
  UserRecordSchema,
  WaitlistSubmissionSchema,
} from "@jj/shared";

const now = "2026-07-11T00:00:00.000Z";

describe("waitlist submission contract", () => {
  const valid = {
    role: "creator",
    email: "Person@Example.com",
    locale: "es",
    consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
  };

  it("accepts the minimum role/email/consent input", () => {
    expect(WaitlistSubmissionSchema.parse(valid).email).toBe("Person@Example.com");
  });

  it("requires consent.accepted to be literally true", () => {
    expect(() => WaitlistSubmissionSchema.parse({ ...valid, consent: { accepted: false, policyVersion: CONSENT_POLICY_VERSION } })).toThrow();
  });

  it("rejects unknown fields (strict)", () => {
    expect(() => WaitlistSubmissionSchema.parse({ ...valid, sneaky: 1 })).toThrow();
  });
});

describe("money contract", () => {
  it("rejects non-integer, negative, or non-GBP amounts", () => {
    expect(() => MoneySchema.parse({ currency: "GBP", amountMinor: 10.5 })).toThrow();
    expect(() => MoneySchema.parse({ currency: "GBP", amountMinor: -1 })).toThrow();
    expect(() => MoneySchema.parse({ currency: "USD", amountMinor: 10 })).toThrow();
  });
});

describe("creator ranking eligibility", () => {
  it("is rankable only when published and available", () => {
    expect(isRankableCreator({ published: true, available: true })).toBe(true);
    expect(isRankableCreator({ published: true, available: false })).toBe(false);
    expect(isRankableCreator({ published: false, available: true })).toBe(false);
  });

  it("defaults collection fields and enforces schemaVersion", () => {
    const profile = CreatorProfileSchema.parse({
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      uid: "u1",
      locale: "en",
      displayName: "Ari",
      published: true,
      available: true,
    });
    expect(profile.niches).toEqual([]);
    expect(() => CreatorProfileSchema.parse({ uid: "u1" })).toThrow();
  });
});

describe("deal record contract", () => {
  it("rejects card/bank fields and requires the money breakdown", () => {
    const base = {
      schemaVersion: SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      id: "d1",
      offerId: "o1",
      offerVersion: 1,
      status: "funded",
      creatorUid: "c1",
      brandUid: "b1",
      creatorAmountMinor: 10_000,
      platformFeeMinor: 1_000,
      brandChargeMinor: 11_000,
    };
    expect(DealSchema.parse(base).status).toBe("funded");
    expect(() => DealSchema.parse({ ...base, cardNumber: "4242" })).toThrow();
  });
});

describe("user identity contract", () => {
  it("requires an immutable role and rejects unknown roles", () => {
    expect(() =>
      UserRecordSchema.parse({
        schemaVersion: SCHEMA_VERSION,
        createdAt: now,
        updatedAt: now,
        uid: "u1",
        email: "a@b.com",
        role: "admin",
        locale: "en",
      }),
    ).toThrow();
  });
});
