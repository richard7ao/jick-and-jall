import { describe, expect, it } from "vitest";
import { REDACTED, looksSensitive, redactSensitive } from "./redact.ts";

describe("looksSensitive", () => {
  it("flags credential-shaped strings from every provider", () => {
    expect(looksSensitive("sk_test_abcd1234EFGH5678")).toBe(true);
    expect(looksSensitive("whsec_abcd1234EFGH5678")).toBe(true);
    expect(looksSensitive("re_abcd1234_EFGH5678")).toBe(true);
    expect(looksSensitive("SL-7123265fb82eb3773ac218486bd1")).toBe(true);
    expect(looksSensitive("GOCSPX-4n6cZuRmC4pPmzO2cZ")).toBe(true);
    expect(looksSensitive("Bearer abcdefgh12345678")).toBe(true);
  });

  it("leaves ordinary strings untouched", () => {
    expect(looksSensitive("agent-2")).toBe(false);
    expect(looksSensitive("https://example.com:8080")).toBe(false);
    expect(looksSensitive("demo-jj")).toBe(false);
  });
});

describe("redactSensitive", () => {
  it("redacts values under sensitive key names regardless of shape", () => {
    const input = {
      SUPERLINKED_API_KEY: "SL-anything",
      client_secret: "not-obviously-a-secret",
      nested: { password: "hunter2" },
    };
    expect(redactSensitive(input)).toEqual({
      SUPERLINKED_API_KEY: REDACTED,
      client_secret: REDACTED,
      nested: { password: REDACTED },
    });
  });

  it("redacts credential-shaped values under non-sensitive keys", () => {
    const providerBody = {
      message: "auth failed for token sk_test_abcd1234EFGH5678",
      items: ["ok", "GOCSPX-4n6cZuRmC4pPmzO2cZ"],
    };
    expect(redactSensitive(providerBody)).toEqual({
      message: REDACTED,
      items: ["ok", REDACTED],
    });
  });

  it("preserves non-sensitive structure and primitives", () => {
    const input = { agent: "agent-2", retries: 3, live: true, model: null };
    expect(redactSensitive(input)).toEqual(input);
  });

  it("does not mutate the original value", () => {
    const input = { token: "keep-me-out" };
    const output = redactSensitive(input) as Record<string, unknown>;
    expect(input.token).toBe("keep-me-out");
    expect(output.token).toBe(REDACTED);
  });
});
