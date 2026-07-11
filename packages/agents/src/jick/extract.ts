import type { TranscriptTurn } from "@jj/shared";
import { z } from "zod";

/**
 * Jick profile extraction. The model is used only for the judgment task of
 * turning a transcript into a structured draft; parsing, validation, and retry
 * are deterministic TypeScript. Invalid model output triggers exactly one retry.
 */
export const ProfileDraftSchema = z
  .object({
    displayName: z.string().min(1).max(120),
    bio: z.string().max(2000).default(""),
    niches: z.array(z.string().min(1)).max(20).default([]),
    platforms: z.array(z.string().min(1)).max(20).default([]),
  })
  .strict();
export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;

export type Generator = (prompt: string) => Promise<string>;

function buildPrompt(transcript: readonly TranscriptTurn[]): string {
  const userSpeech = transcript
    .filter((t) => t.role === "user")
    .map((t) => t.text)
    .join("\n");
  return `Extract a creator profile as strict JSON with keys displayName, bio, niches[], platforms[].\n\n${userSpeech}`;
}

function tryParse(raw: string): ProfileDraft | null {
  try {
    return ProfileDraftSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function extractCreatorProfile(
  transcript: readonly TranscriptTurn[],
  generate: Generator,
): Promise<ProfileDraft> {
  const prompt = buildPrompt(transcript);
  const first = tryParse(await generate(prompt));
  if (first) return first;
  // One deterministic retry with a stricter instruction.
  const second = tryParse(await generate(`${prompt}\n\nReturn ONLY valid JSON.`));
  if (second) return second;
  throw new Error("jick: could not extract a valid profile draft");
}
