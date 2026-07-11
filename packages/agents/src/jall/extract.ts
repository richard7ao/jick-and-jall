import { z } from "zod";
import type { Generator } from "../jick/extract.js";

/**
 * Jall campaign-brief extraction. Like Jick, the model only performs the
 * judgment step; parsing/validation/retry are deterministic. Budget is a GBP
 * integer minor-unit amount.
 */
export const CampaignDraftSchema = z
  .object({
    title: z.string().min(1).max(160),
    brief: z.string().max(4000).default(""),
    budgetMinor: z.number().int().nonnegative(),
  })
  .strict();
export type CampaignDraft = z.infer<typeof CampaignDraftSchema>;

function tryParse(raw: string): CampaignDraft | null {
  try {
    return CampaignDraftSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function extractCampaignBrief(input: string, generate: Generator): Promise<CampaignDraft> {
  const prompt = `Extract a campaign brief as strict JSON with keys title, brief, budgetMinor (GBP pence integer).\n\n${input}`;
  const first = tryParse(await generate(prompt));
  if (first) return first;
  const second = tryParse(await generate(`${prompt}\n\nReturn ONLY valid JSON.`));
  if (second) return second;
  throw new Error("jall: could not extract a valid campaign draft");
}
