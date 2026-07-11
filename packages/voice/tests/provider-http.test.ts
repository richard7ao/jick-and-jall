import { describe, expect, it, vi } from "vitest";

import {
  boundedRetryAfterMs,
  normalizeBaseUrl,
  ProviderError,
  providerFetch,
} from "../src/index.js";

describe("normalizeBaseUrl", () => {
  it("targets /v1 exactly once", () => {
    expect(normalizeBaseUrl("https://api.x.com")).toBe("https://api.x.com/v1");
    expect(normalizeBaseUrl("https://api.x.com/")).toBe("https://api.x.com/v1");
    expect(normalizeBaseUrl("https://api.x.com/v1")).toBe("https://api.x.com/v1");
  });
});

describe("boundedRetryAfterMs", () => {
  it("clamps to [0, max] and ignores invalid values", () => {
    expect(boundedRetryAfterMs("2")).toBe(2000);
    expect(boundedRetryAfterMs("999", 5000)).toBe(5000);
    expect(boundedRetryAfterMs(null)).toBe(0);
    expect(boundedRetryAfterMs("-1")).toBe(0);
    expect(boundedRetryAfterMs("nope")).toBe(0);
  });
});

describe("providerFetch", () => {
  it("sends a host-bound bearer request to the /v1 path and parses JSON", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    ) as unknown as typeof fetch;
    const out = await providerFetch<{ ok: boolean }>("x", {
      baseUrl: "https://api.x.com",
      apiKey: "secret",
      path: "/thing",
      fetchImpl,
    });
    expect(out.ok).toBe(true);
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.x.com/v1/thing");
    expect((init as RequestInit).headers).toMatchObject({
      authorization: "Bearer secret",
    });
  });

  it("throws a redacted ProviderError on non-2xx (no body leak)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("secret-internal-details", { status: 500 }),
    ) as unknown as typeof fetch;
    await expect(
      providerFetch("elevenlabs", {
        baseUrl: "https://api.x.com",
        apiKey: "k",
        path: "/y",
        fetchImpl,
      }),
    ).rejects.toThrowError(ProviderError);
    await expect(
      providerFetch("elevenlabs", {
        baseUrl: "https://api.x.com",
        apiKey: "k",
        path: "/y",
        fetchImpl,
      }),
    ).rejects.toThrow(/elevenlabs request failed \(500\)/);
  });
});
