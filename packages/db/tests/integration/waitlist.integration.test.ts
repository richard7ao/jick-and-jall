import { randomUUID } from "node:crypto";
import { getDb, invitationsRepository, resetDbForTests, waitlistRepository } from "@jj/db";
import { CONSENT_POLICY_VERSION, SCHEMA_VERSION, type Invitation, type WaitlistEntry } from "@jj/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const now = "2026-07-11T00:00:00.000Z";

function entry(id: string): WaitlistEntry {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id,
    role: "creator",
    email: `${randomUUID()}@example.com`,
    locale: "en",
    consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
    status: "pending",
  };
}

function invitation(id: string, expiresAt: string): Invitation {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    id,
    email: "person@example.com",
    role: "creator",
    expiresAt,
    consumedAt: null,
  };
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("requires FIRESTORE_EMULATOR_HOST");
});
afterAll(() => resetDbForTests());

describe("waitlist + invitations (emulator)", () => {
  const waitlist = waitlistRepository(getDb());
  const invitations = invitationsRepository(getDb());

  it("is idempotent on repeated submit of the same id", async () => {
    const e = entry(`w-${randomUUID()}`);
    expect((await waitlist.submit(e)).created).toBe(true);
    expect((await waitlist.submit(e)).created).toBe(false);
  });

  it("consumes an invitation exactly once and rejects replay", async () => {
    const inv = invitation(`i-${randomUUID()}`, "2999-01-01T00:00:00.000Z");
    await invitations.create(inv);
    await invitations.consume(inv.id, now);
    await expect(invitations.consume(inv.id, now)).rejects.toThrow(/already used/);
  });

  it("rejects an expired invitation", async () => {
    const inv = invitation(`i-${randomUUID()}`, "2000-01-01T00:00:00.000Z");
    await invitations.create(inv);
    await expect(invitations.consume(inv.id, now)).rejects.toThrow(/expired/);
  });
});
