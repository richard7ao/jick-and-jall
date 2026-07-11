import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  canAccessMedia,
  createSessionToken,
  csrfMatches,
  requireOwner,
  requireRole,
  verifySessionToken,
} from "../src/index.js";

const secret = "test-secret";
const now = Date.parse("2026-07-11T00:00:00.000Z");

function token(overrides?: { ttl?: number }) {
  return createSessionToken(
    { uid: "u1", role: "creator", locale: "en" },
    secret,
    overrides?.ttl ?? 3600,
    now,
  );
}

describe("session tokens", () => {
  it("round-trips a valid token", () => {
    const s = verifySessionToken(token(), secret, now + 1000);
    expect(s?.uid).toBe("u1");
    expect(s?.role).toBe("creator");
  });

  it("rejects a tampered signature", () => {
    expect(verifySessionToken(token() + "x", secret, now)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    expect(verifySessionToken(token(), "other", now)).toBeNull();
  });

  it("rejects an expired token", () => {
    const expired = createSessionToken(
      { uid: "u1", role: "creator", locale: "en" },
      secret,
      1,
      now,
    );
    expect(verifySessionToken(expired, secret, now + 5000)).toBeNull();
  });
});

describe("authorization", () => {
  const session = { uid: "u1", role: "creator" as const, locale: "en" as const, exp: 1 };

  it("enforces role", () => {
    expect(() => requireRole(session, "brand")).toThrow(AuthorizationError);
    expect(requireRole(session, "creator").uid).toBe("u1");
  });

  it("enforces ownership", () => {
    expect(() => requireOwner(session, "someone-else")).toThrow(AuthorizationError);
    expect(requireOwner(session, "u1").uid).toBe("u1");
  });

  it("gates media by owner", () => {
    expect(canAccessMedia(session, "u1")).toBe(true);
    expect(canAccessMedia(session, "other")).toBe(false);
    expect(canAccessMedia(null, "u1")).toBe(false);
  });
});

describe("csrf", () => {
  it("matches only identical non-empty tokens", () => {
    expect(csrfMatches("abc", "abc")).toBe(true);
    expect(csrfMatches("abc", "abd")).toBe(false);
    expect(csrfMatches("", "")).toBe(false);
    expect(csrfMatches(null, "abc")).toBe(false);
  });
});
