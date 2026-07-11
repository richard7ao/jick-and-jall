import { describe, expect, it } from "vitest";
import {
  assertOwner,
  assertRole,
  AuthorizationError,
  clearSessionCookie,
  generateCsrfToken,
  parseCookies,
  readSessionCookie,
  serializeSessionCookie,
  SESSION_COOKIE_NAME,
  verifyCsrfToken,
} from "@jj/auth";

describe("CSRF", () => {
  it("verifies a matching token and rejects mismatches/empties", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, token)).toBe(true);
    expect(verifyCsrfToken(token, generateCsrfToken())).toBe(false);
    expect(verifyCsrfToken(token, "")).toBe(false);
    expect(verifyCsrfToken(undefined, token)).toBe(false);
  });

  it("produces unique high-entropy tokens", () => {
    expect(generateCsrfToken()).not.toBe(generateCsrfToken());
  });
});

describe("session cookies", () => {
  it("serializes a hardened cookie and round-trips the value", () => {
    const cookie = serializeSessionCookie("abc123", { maxAgeSeconds: 3600 });
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=abc123`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
    expect(readSessionCookie(`${SESSION_COOKIE_NAME}=abc123`)).toBe("abc123");
  });

  it("clears with Max-Age=0 and parses multiple cookies", () => {
    expect(clearSessionCookie()).toContain("Max-Age=0");
    expect(parseCookies("a=1; __session=xyz; b=2").__session).toBe("xyz");
  });
});

describe("authorization", () => {
  it("enforces ownership and role, throwing AuthorizationError", () => {
    const principal = { uid: "u1", role: "creator" as const };
    expect(() => assertOwner(principal, "u1")).not.toThrow();
    expect(() => assertOwner(principal, "u2")).toThrow(AuthorizationError);
    expect(() => assertRole(principal, "creator")).not.toThrow();
    expect(() => assertRole(principal, "brand")).toThrow(AuthorizationError);
  });
});
