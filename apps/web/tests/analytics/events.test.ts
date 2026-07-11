import { describe, expect, it, vi } from "vitest";
import { buildEvent, sanitizeProps, track } from "../../src/analytics/events";

describe("analytics privacy", () => {
  it("strips any non-allowlisted property (email, name, id)", () => {
    const props = sanitizeProps({ role: "creator", locale: "es", email: "a@b.com", name: "Ari", id: "x" });
    expect(props).toEqual({ role: "creator", locale: "es" });
  });

  it("builds events with only safe props", () => {
    const event = buildEvent("waitlist_submit", { role: "brand", email: "leak@x.com" });
    expect(event).toEqual({ name: "waitlist_submit", props: { role: "brand" } });
  });

  it("routes sanitized events to the provided sink", () => {
    const sink = vi.fn();
    track("waitlist_view", { locale: "en", email: "no@no.com" }, sink);
    expect(sink).toHaveBeenCalledWith({ name: "waitlist_view", props: { locale: "en" } });
  });
});
