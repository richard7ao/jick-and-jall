import { SCHEMA_VERSION, type VoiceSession } from "@jj/shared";
import { describe, expect, it, vi } from "vitest";
import { purgeExpiredSessions, selectExpiredSessions, type PurgeDeps } from "@jj/agents";

const NOW = "2026-07-11T00:00:00.000Z";

function session(id: string, createdAt: string): VoiceSession {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt,
    updatedAt: createdAt,
    id,
    uid: "u1",
    locale: "en",
    consentVersion: "2026-07-11",
    status: "completed",
    transcript: [],
    recordingStored: true,
    retentionDays: 90,
  };
}

const oldSession = session("old", "2026-01-01T00:00:00.000Z"); // >90 days
const newSession = session("new", "2026-07-10T00:00:00.000Z"); // <90 days

describe("retention selection", () => {
  it("selects only sessions older than the window", () => {
    const expired = selectExpiredSessions([oldSession, newSession], NOW);
    expect(expired.map((s) => s.id)).toEqual(["old"]);
  });
});

describe("purgeExpiredSessions", () => {
  function deps(overrides: Partial<PurgeDeps> = {}): PurgeDeps {
    return {
      listOlderThan: async () => [oldSession],
      deleteUpstream: async () => {},
      deleteStorage: async () => {},
      deleteFirestore: async () => {},
      ...overrides,
    };
  }

  it("purges expired sessions from all three stores", async () => {
    const d = deps();
    const upstream = vi.spyOn(d, "deleteUpstream");
    const result = await purgeExpiredSessions(d, NOW);
    expect(result.purged).toEqual(["old"]);
    expect(result.failed).toEqual([]);
    expect(upstream).toHaveBeenCalled();
  });

  it("keeps going when one deletion fails and reports it for retry", async () => {
    const two = [oldSession, session("old2", "2026-01-02T00:00:00.000Z")];
    const d = deps({
      listOlderThan: async () => two,
      deleteFirestore: async (id) => {
        if (id === "old") throw new Error("transient");
      },
    });
    const result = await purgeExpiredSessions(d, NOW);
    expect(result.failed).toEqual(["old"]);
    expect(result.purged).toEqual(["old2"]);
  });
});
