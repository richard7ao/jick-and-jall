import type { TranscriptTurn } from "@jj/shared";
import { describe, expect, it, vi } from "vitest";
import { extractCreatorProfile } from "@jj/agents";

const transcript: TranscriptTurn[] = [
  { role: "agent", text: "Tell me about yourself", at: "2026-07-11T00:00:00.000Z" },
  { role: "user", text: "I'm Ari, I make travel content on instagram", at: "2026-07-11T00:00:01.000Z" },
];

const validDraft = JSON.stringify({ displayName: "Ari", bio: "Travel", niches: ["travel"], platforms: ["instagram"] });

describe("extractCreatorProfile", () => {
  it("parses a valid draft from the generator", async () => {
    const draft = await extractCreatorProfile(transcript, async () => validDraft);
    expect(draft.displayName).toBe("Ari");
    expect(draft.niches).toEqual(["travel"]);
  });

  it("retries exactly once on invalid output, then succeeds", async () => {
    const gen = vi.fn().mockResolvedValueOnce("not json").mockResolvedValueOnce(validDraft);
    const draft = await extractCreatorProfile(transcript, gen as unknown as (p: string) => Promise<string>);
    expect(draft.displayName).toBe("Ari");
    expect(gen).toHaveBeenCalledTimes(2);
  });

  it("throws after a failed retry", async () => {
    await expect(extractCreatorProfile(transcript, async () => "still not json")).rejects.toThrow();
  });

  it("only feeds user speech (not agent prompts) to the generator", async () => {
    const gen = vi.fn().mockResolvedValue(validDraft);
    await extractCreatorProfile(transcript, gen as unknown as (p: string) => Promise<string>);
    const prompt = gen.mock.calls[0]![0] as string;
    expect(prompt).toContain("travel content");
    expect(prompt).not.toContain("Tell me about yourself");
  });
});
