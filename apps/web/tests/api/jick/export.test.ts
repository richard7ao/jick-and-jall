// @vitest-environment node
import type { Principal } from "@jj/auth";
import { SCHEMA_VERSION, type VoiceSession } from "@jj/shared";
import { describe, expect, it } from "vitest";
import { handleExport, type ExportDeps } from "../../../app/api/account/export/route";

const creator: Principal = { uid: "c1", role: "creator" };

const session: VoiceSession = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
  id: "s1",
  uid: "c1",
  locale: "en",
  consentVersion: "2026-07-11",
  status: "completed",
  transcript: [{ role: "user", text: "hi", at: "2026-07-11T00:00:00.000Z" }],
  recordingStored: true,
  retentionDays: 90,
};

function deps(principal: Principal | null): ExportDeps {
  return {
    getPrincipal: () => principal,
    getProfile: async () => null,
    listSessions: async () => [session],
  };
}

describe("account export", () => {
  it("forbids unauthenticated export", async () => {
    expect((await handleExport(new Request("http://x"), deps(null))).status).toBe(403);
  });

  it("exports metadata only — never recordings, transcripts, or signed URLs", async () => {
    const res = await handleExport(new Request("http://x"), deps(creator));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(res.headers.get("content-disposition")).toContain("attachment");
    expect(body.voiceSessions[0]).toEqual({
      id: "s1",
      createdAt: "2026-07-11T00:00:00.000Z",
      status: "completed",
      recordingStored: true,
      transcriptTurns: 1,
    });
    expect(JSON.stringify(body)).not.toContain("hi"); // transcript text excluded
  });
});
