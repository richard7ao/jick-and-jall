import { describe, expect, it } from "vitest";

import { locales } from "../../lib/i18n";
import { getMarketing } from "../../lib/marketing";

const collectKeys = (value: unknown, prefix = ""): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => collectKeys(child, `${prefix}[${index}]`));
  }
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => collectKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
};

describe("marketing content", () => {
  it("exposes three how-it-works steps per locale", () => {
    for (const locale of locales) {
      expect(getMarketing(locale).howItWorks.steps).toHaveLength(3);
    }
  });

  it("keeps English and Spanish marketing copy structurally equivalent", () => {
    expect(collectKeys(getMarketing("es"))).toEqual(collectKeys(getMarketing("en")));
  });

  it("never ships an empty marketing string", () => {
    for (const locale of locales) {
      const m = getMarketing(locale);
      const strings = [
        m.howItWorks.title,
        ...m.howItWorks.steps.flatMap((s) => [s.title, s.body]),
        ...[m.creator, m.brand].flatMap((side) => [
          side.eyebrow,
          side.title,
          side.body,
          ...side.points,
        ]),
        m.cta.title,
        m.cta.subtitle,
        m.cta.action,
      ];
      expect(strings.every((value) => value.trim().length > 0)).toBe(true);
    }
  });
});
