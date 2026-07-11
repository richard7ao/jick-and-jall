import { describe, expect, it, vi } from "vitest";
import { createSuperlinkedClient } from "@jj/agents";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function client(fetchImpl: typeof fetch) {
  return createSuperlinkedClient({ baseUrl: "https://sl.example/v1", apiKey: "k", fetchImpl });
}

describe("Superlinked client", () => {
  it("embeds text against /v1/embeddings", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ embedding: [0.1, 0.2] }));
    const out = await client(fetchImpl as unknown as typeof fetch).embed("travel creator");
    expect(out).toEqual([0.1, 0.2]);
    expect(fetchImpl.mock.calls[0]![0]).toBe("https://sl.example/v1/embeddings");
  });

  it("generates text and validates the response shape", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ text: "hello" }));
    expect(await client(fetchImpl as unknown as typeof fetch).generate("prompt")).toBe("hello");
  });

  it("rejects a malformed response", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ wrong: true }));
    await expect(client(fetchImpl as unknown as typeof fetch).embed("x")).rejects.toBeTruthy();
  });
});
