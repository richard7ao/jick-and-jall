// @vitest-environment node
import type { Principal } from "@jj/auth";
import { describe, expect, it } from "vitest";
import { handleMediaRequest, type MediaDeps } from "../../../app/api/media/route";

function makeDeps(principal: Principal | null, exists = true): MediaDeps {
  return {
    getPrincipal: () => principal,
    admins: new Set(["admin-1"]),
    exists: async () => exists,
    signUrl: async (path) => `https://signed/${path}?token=abc`,
  };
}

function req(path: string): Request {
  return new Request(`http://localhost/api/media?path=${encodeURIComponent(path)}`);
}

const owner: Principal = { uid: "owner-1", role: "creator" };
const path = "recordings/owner-1/rec-1";

describe("GET /api/media", () => {
  it("returns a private signed URL to the owner", async () => {
    const res = await handleMediaRequest(req(path), makeDeps(owner));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect((await res.json()).url).toContain("signed");
  });

  it("returns an indistinguishable 404 for non-owners and missing files", async () => {
    const denied = await handleMediaRequest(req(path), makeDeps({ uid: "x", role: "brand" }));
    const missing = await handleMediaRequest(req(path), makeDeps(owner, false));
    expect(denied.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(await denied.json()).toEqual(await missing.json());
  });

  it("404s for non-recording paths without leaking structure", async () => {
    expect((await handleMediaRequest(req("secrets/passwd"), makeDeps(owner))).status).toBe(404);
  });
});
