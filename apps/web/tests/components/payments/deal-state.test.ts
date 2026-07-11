import { describe, expect, it } from "vitest";

import {
  brandChargeMinor,
  canTransition,
  isTerminal,
  platformFeeMinor,
} from "../../../lib/deal-state";

describe("deal state machine", () => {
  it("allows the happy-path transitions", () => {
    expect(canTransition("mutually_accepted", "funded")).toBe(true);
    expect(canTransition("funded", "delivered")).toBe(true);
    expect(canTransition("delivered", "approved")).toBe(true);
    expect(canTransition("approved", "payout_pending")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransition("funded", "paid")).toBe(false);
    expect(canTransition("complete", "offered")).toBe(false);
  });

  it("knows terminal states", () => {
    expect(isTerminal("complete")).toBe(true);
    expect(isTerminal("cancelled")).toBe(true);
    expect(isTerminal("funded")).toBe(false);
  });
});

describe("money math (GBP minor units, brand pays creator + 10%)", () => {
  it("computes the 10% platform fee", () => {
    expect(platformFeeMinor(50_000)).toBe(5_000);
    expect(platformFeeMinor(12_345)).toBe(1_235); // rounded
  });

  it("charges the brand creator amount plus fee", () => {
    expect(brandChargeMinor(50_000)).toBe(55_000);
  });
});
