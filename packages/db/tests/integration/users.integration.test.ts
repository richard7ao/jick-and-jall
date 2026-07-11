import { randomUUID } from "node:crypto";
import { getDb, resetDbForTests, usersRepository } from "@jj/db";
import { SCHEMA_VERSION, type UserRecord } from "@jj/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Runs only under the Firebase emulator (FIRESTORE_EMULATOR_HOST set by the
// firebase:exec wrapper). Uses unique uids so tests do not collide.
const now = "2026-07-11T00:00:00.000Z";

function makeUser(): UserRecord {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    uid: `u-${randomUUID()}`,
    email: `${randomUUID()}@example.com`,
    role: "creator",
    locale: "en",
  };
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("integration tests require FIRESTORE_EMULATOR_HOST (run via pnpm firebase:exec)");
  }
});

afterAll(() => resetDbForTests());

describe("usersRepository (emulator)", () => {
  const repo = usersRepository(getDb());

  it("creates and reads back a user", async () => {
    const user = makeUser();
    await repo.create(user);
    expect(await repo.get(user.uid)).toEqual(user);
  });

  it("returns null for an unknown uid", async () => {
    expect(await repo.get(`missing-${randomUUID()}`)).toBeNull();
  });

  it("rejects a duplicate identity for the same uid", async () => {
    const user = makeUser();
    await repo.create(user);
    await expect(repo.create(user)).rejects.toThrow();
  });

  it("updates locale without altering the immutable role", async () => {
    const user = makeUser();
    await repo.create(user);
    await repo.setLocale(user.uid, "es", "2026-07-12T00:00:00.000Z");
    const updated = await repo.get(user.uid);
    expect(updated?.locale).toBe("es");
    expect(updated?.role).toBe("creator");
  });
});
