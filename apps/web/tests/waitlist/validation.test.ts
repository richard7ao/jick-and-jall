import { describe, expect, it } from "vitest";

import { getWaitlistCopy, isWaitlistRole, validateWaitlist } from "../../lib/waitlist";

const messages = getWaitlistCopy("en").errors;

describe("validateWaitlist", () => {
  it("accepts a complete, well-formed entry", () => {
    expect(validateWaitlist({ role: "creator", email: "a@b.co", consent: true }, messages)).toEqual(
      {},
    );
  });

  it("requires a role", () => {
    const errors = validateWaitlist({ role: null, email: "a@b.co", consent: true }, messages);
    expect(errors.role).toBe(messages.role);
  });

  it("rejects malformed emails and trims before checking", () => {
    expect(validateWaitlist({ role: "brand", email: "nope", consent: true }, messages).email).toBe(
      messages.email,
    );
    expect(
      validateWaitlist({ role: "brand", email: "  a@b.co  ", consent: true }, messages).email,
    ).toBeUndefined();
  });

  it("requires explicit consent", () => {
    expect(
      validateWaitlist({ role: "brand", email: "a@b.co", consent: false }, messages).consent,
    ).toBe(messages.consent);
  });
});

describe("isWaitlistRole", () => {
  it("accepts only creator or brand", () => {
    expect(isWaitlistRole("creator")).toBe(true);
    expect(isWaitlistRole("brand")).toBe(true);
    expect(isWaitlistRole("admin")).toBe(false);
  });
});
