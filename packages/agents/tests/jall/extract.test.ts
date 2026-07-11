import { describe, expect, it, vi } from "vitest";
import { extractCampaignBrief } from "@jj/agents";

const valid = JSON.stringify({ title: "Summer launch", brief: "UGC creators", budgetMinor: 500000 });

describe("extractCampaignBrief", () => {
  it("parses a valid campaign draft with integer budget", async () => {
    const draft = await extractCampaignBrief("we want summer UGC, budget 5000 pounds", async () => valid);
    expect(draft.title).toBe("Summer launch");
    expect(draft.budgetMinor).toBe(500000);
  });

  it("retries once then throws on invalid output", async () => {
    const gen = vi.fn().mockResolvedValueOnce("nope").mockResolvedValueOnce(valid);
    expect((await extractCampaignBrief("x", gen as unknown as (p: string) => Promise<string>)).title).toBe("Summer launch");
    await expect(extractCampaignBrief("x", async () => "bad")).rejects.toThrow();
  });

  it("rejects a non-integer budget", async () => {
    await expect(
      extractCampaignBrief("x", async () => JSON.stringify({ title: "t", brief: "", budgetMinor: 1.5 })),
    ).rejects.toThrow();
  });
});
