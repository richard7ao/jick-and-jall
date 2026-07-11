import { zodConverter } from "@jj/db";
import { SCHEMA_VERSION, UserRecordSchema, type UserRecord } from "@jj/shared";
import { describe, expect, it } from "vitest";

const now = "2026-07-11T00:00:00.000Z";
const user: UserRecord = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  uid: "u1",
  email: "u1@example.com",
  role: "creator",
  locale: "en",
};

describe("zodConverter", () => {
  const converter = zodConverter(UserRecordSchema);

  it("validates on write and rejects malformed data", () => {
    expect(converter.toFirestore(user)).toMatchObject({ uid: "u1", role: "creator" });
    expect(() => converter.toFirestore({ ...user, role: "admin" } as unknown as UserRecord)).toThrow();
  });

  it("parses on read via a snapshot", () => {
    const snapshot = { data: () => user } as unknown as Parameters<typeof converter.fromFirestore>[0];
    expect(converter.fromFirestore(snapshot)).toEqual(user);
  });

  it("rejects unknown fields on read (strict schema)", () => {
    const snapshot = { data: () => ({ ...user, extra: 1 }) } as unknown as Parameters<
      typeof converter.fromFirestore
    >[0];
    expect(() => converter.fromFirestore(snapshot)).toThrow();
  });
});
