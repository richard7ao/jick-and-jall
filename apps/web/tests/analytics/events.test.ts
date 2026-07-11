import { describe, expect, it } from "vitest";

import { isAnalyticsEvent, sanitizeEventProps } from "../../src/analytics/events";

describe("isAnalyticsEvent", () => {
  it("accepts only allowlisted event names", () => {
    expect(isAnalyticsEvent("waitlist_submitted")).toBe(true);
    expect(isAnalyticsEvent("marketing_view")).toBe(true);
    expect(isAnalyticsEvent("steal_pii")).toBe(false);
  });
});

describe("sanitizeEventProps", () => {
  it("keeps allowlisted, non-identifying props", () => {
    expect(sanitizeEventProps({ role: "creator", locale: "es" })).toEqual({
      role: "creator",
      locale: "es",
    });
  });

  it("drops PII and any non-allowlisted keys", () => {
    expect(
      sanitizeEventProps({
        role: "brand",
        email: "person@example.com",
        name: "Real Name",
        handle: "@person",
      }),
    ).toEqual({ role: "brand" });
  });

  it("drops non-string and over-long values", () => {
    expect(sanitizeEventProps({ role: 123, locale: "x".repeat(65) })).toEqual({});
  });
});
