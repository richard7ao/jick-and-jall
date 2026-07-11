import { describe, expect, it } from "vitest";
import { decideMediaAccess, ownerFromRecordingPath, recordingPath } from "@jj/auth";

const owner = { uid: "owner-1", role: "creator" as const };
const other = { uid: "other-9", role: "brand" as const };

describe("media authorization", () => {
  it("allows the owner and configured admins, denies everyone else", () => {
    const admins = new Set(["admin-1"]);
    expect(decideMediaAccess(owner, "owner-1", admins)).toBe("allow");
    expect(decideMediaAccess({ uid: "admin-1", role: "brand" }, "owner-1", admins)).toBe("allow");
    expect(decideMediaAccess(other, "owner-1", admins)).toBe("deny");
    expect(decideMediaAccess(null, "owner-1", admins)).toBe("deny");
  });

  it("round-trips owner-scoped recording paths", () => {
    const path = recordingPath("owner-1", "rec-1");
    expect(path).toBe("recordings/owner-1/rec-1");
    expect(ownerFromRecordingPath(path)).toBe("owner-1");
    expect(ownerFromRecordingPath("secrets/x")).toBeNull();
  });
});
