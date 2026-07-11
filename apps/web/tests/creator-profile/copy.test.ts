import { describe, expect, it } from "vitest";

import { getCreatorProfileCopy } from "../../lib/copy/creator-profile";
import { getOnboardingCopy } from "../../lib/copy/onboarding";

const keys = (value: unknown): string[] => {
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([k, v]) =>
      typeof v === "object" && v !== null && !Array.isArray(v)
        ? keys(v).map((c) => `${k}.${c}`)
        : [k],
    )
    .sort();
};

describe("creator copy parity", () => {
  it("keeps profile copy structurally equal across locales", () => {
    expect(keys(getCreatorProfileCopy("es"))).toEqual(keys(getCreatorProfileCopy("en")));
  });

  it("uses the same interview question ids in both locales", () => {
    const en = getOnboardingCopy("en").questions.map((q) => q.id);
    const es = getOnboardingCopy("es").questions.map((q) => q.id);
    expect(es).toEqual(en);
  });
});
