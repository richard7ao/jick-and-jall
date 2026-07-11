// @vitest-environment node
import type { Principal } from "@jj/auth";
import type { CreatorProfile } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleGetProfile, handlePutProfile, type ProfileDeps } from "../../../app/api/creator/profile/route";

const creator: Principal = { uid: "c1", role: "creator" };
const now = "2026-07-11T00:00:00.000Z";

function makeDeps(principal: Principal | null, existing: CreatorProfile | null = null) {
  const store: { profile: CreatorProfile | null } = { profile: existing };
  const deps: ProfileDeps = {
    getPrincipal: () => principal,
    get: async () => store.profile,
    upsert: async (p) => {
      store.profile = p;
      return p;
    },
    now: () => now,
  };
  return { deps, store };
}

function put(body: unknown): Request {
  return new Request("http://localhost/api/creator/profile", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("creator profile API", () => {
  it("forbids non-creators", async () => {
    expect((await handleGetProfile(new Request("http://x"), makeDeps({ uid: "b", role: "brand" }).deps)).status).toBe(403);
  });

  it("stamps server-owned uid and rejects spoofed uid", async () => {
    const { deps, store } = makeDeps(creator);
    const res = await handlePutProfile(
      put({ uid: "someone-else", locale: "en", displayName: "Ari", published: false, available: true }),
      deps,
    );
    expect(res.status).toBe(200);
    expect(store.profile?.uid).toBe("c1");
  });

  it("returns 404 before a profile exists, then the profile after upsert", async () => {
    const { deps } = makeDeps(creator);
    expect((await handleGetProfile(new Request("http://x"), deps)).status).toBe(404);
    await handlePutProfile(put({ locale: "en", displayName: "Ari", published: true, available: true }), deps);
    const got = await handleGetProfile(new Request("http://x"), deps);
    expect(got.status).toBe(200);
    expect((await got.json()).displayName).toBe("Ari");
  });

  it("rejects invalid drafts", async () => {
    const { deps } = makeDeps(creator);
    expect((await handlePutProfile(put({ locale: "en" }), deps)).status).toBe(400);
  });
});
