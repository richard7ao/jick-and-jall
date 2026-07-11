import { describe, expect, it } from "vitest";
import {
  canTransitionDeal,
  DealStatusSchema,
  isTerminalDealStatus,
  nextDealStatuses,
  type DealStatus,
} from "@jj/shared";

const ALL = DealStatusSchema.options as readonly DealStatus[];

describe("deal state machine", () => {
  it("allows the canonical happy path end to end", () => {
    const path: DealStatus[] = [
      "draft",
      "offered",
      "accepted_by_one_party",
      "mutually_accepted",
      "funded",
      "delivered",
      "approved",
      "payout_pending",
      "paid",
      "complete",
    ];
    for (let i = 0; i < path.length - 1; i += 1) {
      expect(canTransitionDeal(path[i]!, path[i + 1]!), `${path[i]} -> ${path[i + 1]}`).toBe(true);
    }
  });

  it("rejects illegal jumps", () => {
    expect(canTransitionDeal("draft", "paid")).toBe(false);
    expect(canTransitionDeal("funded", "complete")).toBe(false);
    expect(canTransitionDeal("complete", "draft")).toBe(false);
  });

  it("treats complete and cancelled as terminal", () => {
    expect(isTerminalDealStatus("complete")).toBe(true);
    expect(isTerminalDealStatus("cancelled")).toBe(true);
    expect(nextDealStatuses("complete")).toEqual([]);
  });

  it("never lists a status as a transition to itself", () => {
    for (const status of ALL) {
      expect(nextDealStatuses(status)).not.toContain(status);
    }
  });

  it("only references known statuses in the transition table", () => {
    const known = new Set(ALL);
    for (const status of ALL) {
      for (const next of nextDealStatuses(status)) expect(known.has(next)).toBe(true);
    }
  });
});
