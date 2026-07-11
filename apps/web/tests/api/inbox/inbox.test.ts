// @vitest-environment node
import type { Principal } from "@jj/auth";
import type { Thread } from "@jj/db";
import { SCHEMA_VERSION, type Match, type Message } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleOpenThread, handleSendMessage, type InboxDeps } from "../../../app/api/inbox/route";

const now = "2026-07-11T00:00:00.000Z";
const brand: Principal = { uid: "b1", role: "brand" };
const creator: Principal = { uid: "cr1", role: "creator" };

const consentedMatch: Match = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  id: "m1",
  campaignId: "camp-1",
  creatorUid: "cr1",
  brandUid: "b1",
  score: 0.9,
  disclosureConsented: true,
};

function makeDeps(principal: Principal | null, match: Match = consentedMatch) {
  const threads: Thread[] = [];
  const messages: Message[] = [];
  const deps: InboxDeps = {
    getPrincipal: () => principal,
    getMatch: async () => match,
    upsertThread: async (t) => {
      threads.push(t);
      return t;
    },
    getThread: async (id) => threads.find((t) => t.id === id) ?? null,
    listThreads: async (uid) => threads.filter((t) => t.brandUid === uid || t.creatorUid === uid),
    appendMessage: async (m) => {
      messages.push(m);
      return m;
    },
    now: () => now,
    threadId: (mid) => `t-${mid}`,
    messageId: () => "msg-1",
  };
  return { deps, threads, messages };
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/inbox", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("inbox", () => {
  it("opens a thread from a consented match for a participant", async () => {
    const { deps, threads } = makeDeps(brand);
    const res = await handleOpenThread(post({ matchId: "m1" }), deps);
    expect(res.status).toBe(200);
    expect(threads[0]?.creatorUid).toBe("cr1");
  });

  it("refuses to open a thread without creator consent", async () => {
    const { deps } = makeDeps(brand, { ...consentedMatch, disclosureConsented: false });
    expect((await handleOpenThread(post({ matchId: "m1" }), deps)).status).toBe(409);
  });

  it("blocks non-participants from opening or posting", async () => {
    const stranger = makeDeps({ uid: "x", role: "brand" });
    expect((await handleOpenThread(post({ matchId: "m1" }), stranger.deps)).status).toBe(403);
  });

  it("lets a participant post a message to their thread", async () => {
    const { deps, messages } = makeDeps(creator);
    await handleOpenThread(post({ matchId: "m1" }), deps);
    const res = await handleSendMessage(post({ threadId: "t-m1", body: "hello" }), deps);
    expect(res.status).toBe(201);
    expect(messages[0]?.senderUid).toBe("cr1");
  });
});
