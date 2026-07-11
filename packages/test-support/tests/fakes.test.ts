import { describe, expect, it } from "vitest";
import { FakeEmailProvider } from "../src/fakes/email.ts";
import { FakeElevenLabs } from "../src/fakes/elevenlabs.ts";
import { cosineSimilarity, FakeSuperlinked } from "../src/fakes/superlinked.ts";
import { creatorProfileFixture, waitlistSubmissionFixture } from "../src/fixtures.ts";
import { CreatorProfileSchema, isRankableCreator, WaitlistSubmissionSchema } from "@jj/shared";

describe("FakeEmailProvider", () => {
  it("records sends and finds the last message to a recipient", async () => {
    const email = new FakeEmailProvider();
    await email.send({ to: "a@b.com", template: "welcome", locale: "es" });
    expect(email.sent).toHaveLength(1);
    expect(email.lastTo("a@b.com")?.locale).toBe("es");
  });

  it("injects retryable failures then recovers", async () => {
    const email = new FakeEmailProvider();
    email.failNext(1);
    await expect(email.send({ to: "a@b.com", template: "welcome", locale: "en" })).rejects.toThrow();
    await expect(email.send({ to: "a@b.com", template: "welcome", locale: "en" })).resolves.toEqual({ delivered: true });
  });
});

describe("FakeSuperlinked", () => {
  it("produces deterministic, fixed-length embeddings", async () => {
    const sl = new FakeSuperlinked();
    const a = await sl.embed("travel creator");
    const b = await sl.embed("travel creator");
    expect(a).toEqual(b);
    expect(a).toHaveLength(8);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5);
  });
});

describe("FakeElevenLabs", () => {
  it("issues unique tokens and a bilingual transcript", async () => {
    const el = new FakeElevenLabs();
    expect(await el.issueToken("u1")).not.toBe(await el.issueToken("u1"));
    const es = await el.transcript("es");
    expect(es[0]?.text).toContain("Hola");
  });
});

describe("fixtures conform to shared schemas", () => {
  it("creatorProfileFixture parses and is rankable", () => {
    const profile = CreatorProfileSchema.parse(creatorProfileFixture());
    expect(isRankableCreator(profile)).toBe(true);
  });

  it("waitlistSubmissionFixture parses", () => {
    expect(() => WaitlistSubmissionSchema.parse(waitlistSubmissionFixture())).not.toThrow();
  });
});
