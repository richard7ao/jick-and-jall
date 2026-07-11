import { describe, expect, it, vi } from "vitest";

import { createTracker } from "../../src/analytics/track";
import type { AnalyticsPayload } from "../../src/analytics/events";

describe("createTracker", () => {
  it("does nothing when Do-Not-Track is enabled", () => {
    const transport = vi.fn();
    const track = createTracker({ transport, doNotTrack: true });
    expect(track("waitlist_submitted", { role: "creator" })).toBe(false);
    expect(transport).not.toHaveBeenCalled();
  });

  it("ignores unknown events", () => {
    const transport = vi.fn();
    const track = createTracker({ transport, doNotTrack: false });
    expect(track("hack_attempt", { role: "creator" })).toBe(false);
    expect(transport).not.toHaveBeenCalled();
  });

  it("sends sanitized payloads for known events", () => {
    const payloads: AnalyticsPayload[] = [];
    const track = createTracker({
      transport: (payload) => payloads.push(payload),
      doNotTrack: false,
    });

    expect(
      track("waitlist_submitted", {
        role: "brand",
        email: "person@example.com",
      }),
    ).toBe(true);

    expect(payloads).toHaveLength(1);
    expect(payloads[0]!.event).toBe("waitlist_submitted");
    expect(payloads[0]!.props).toEqual({ role: "brand" });
    expect(typeof payloads[0]!.ts).toBe("number");
  });
});
