import { describe, expect, it, vi } from "vitest";
import { createElevenLabsClient, ProviderError } from "@jj/voice";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, ...init });
}

function client(fetchImpl: typeof fetch, sleep = vi.fn(async () => {})) {
  return createElevenLabsClient({
    baseUrl: "https://api.elevenlabs.example/",
    apiKey: "secret-key",
    maxRetryAfterMs: 1000,
    fetchImpl,
    sleep,
  });
}

describe("ElevenLabs client", () => {
  it("normalizes to /v1 and sends host-bound bearer auth", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ token: "t", expiresAt: "later" }));
    await client(fetchImpl as unknown as typeof fetch).issueConversationToken("uid-1");
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.elevenlabs.example/v1/convai/conversation/token");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer secret-key" });
  });

  it("retries once on 429 within the bounded Retry-After", async () => {
    const sleep = vi.fn(async () => {});
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 429, headers: { "retry-after": "9999" } }))
      .mockResolvedValueOnce(jsonResponse({ token: "t", expiresAt: "later" }));
    const res = await client(fetchImpl as unknown as typeof fetch, sleep).issueConversationToken("uid-1");
    expect(res.token).toBe("t");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1000); // capped at maxRetryAfterMs
  });

  it("throws a redacted ProviderError (status only, no body) on failure", async () => {
    const fetchImpl = vi.fn(async () => new Response("SENSITIVE BODY", { status: 500 }));
    await expect(client(fetchImpl as unknown as typeof fetch).issueConversationToken("u")).rejects.toBeInstanceOf(
      ProviderError,
    );
    try {
      await client(fetchImpl as unknown as typeof fetch).issueConversationToken("u");
    } catch (e) {
      expect((e as Error).message).not.toContain("SENSITIVE");
      expect((e as ProviderError).status).toBe(500);
    }
  });

  it("propagates upstream deletion", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ deleted: true }));
    expect(await client(fetchImpl as unknown as typeof fetch).deleteConversation("c1")).toBe(true);
  });
});
