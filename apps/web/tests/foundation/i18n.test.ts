import { describe, expect, it } from "vitest";

import { getDictionary, type Dictionary } from "../../lib/dictionary";
import { defaultLocale, isLocale, locales, negotiateLocale, splitLocale } from "../../lib/i18n";

describe("locale primitives", () => {
  it("recognises only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });

  it("negotiates the best locale from Accept-Language, honouring q-weights", () => {
    expect(negotiateLocale("es-ES,es;q=0.9,en;q=0.8")).toBe("es");
    expect(negotiateLocale("en-GB,en;q=0.9")).toBe("en");
    expect(negotiateLocale("fr-FR,fr;q=0.9,es;q=0.4")).toBe("es");
    expect(negotiateLocale("fr-FR")).toBe(defaultLocale);
    expect(negotiateLocale(null)).toBe(defaultLocale);
  });

  it("splits a leading locale segment from the rest of the path", () => {
    expect(splitLocale("/en/waitlist")).toEqual({ locale: "en", rest: "/waitlist" });
    expect(splitLocale("/es")).toEqual({ locale: "es", rest: "/" });
    expect(splitLocale("/waitlist")).toEqual({ locale: null, rest: "/waitlist" });
  });
});

describe("bilingual dictionaries", () => {
  const collectKeys = (value: unknown, prefix = ""): string[] => {
    if (value === null || typeof value !== "object") return [prefix];
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, child]) => collectKeys(child, prefix ? `${prefix}.${key}` : key))
      .sort();
  };

  it("loads both locales", () => {
    for (const locale of locales) {
      const dict = getDictionary(locale);
      expect(dict.meta.locale).toBe(locale);
      expect(dict.hero.title.length).toBeGreaterThan(0);
    }
  });

  it("keeps English and Spanish structurally equivalent", () => {
    const en = getDictionary("en");
    const es = getDictionary("es");
    expect(collectKeys(es)).toEqual(collectKeys(en));
  });

  it("never leaves a rendered string empty in either locale", () => {
    const nonEmpty = (dict: Dictionary): boolean =>
      Object.values(dict)
        .flatMap((section) => Object.values(section))
        .every((value) => typeof value !== "string" || value.trim().length > 0);
    expect(nonEmpty(getDictionary("en"))).toBe(true);
    expect(nonEmpty(getDictionary("es"))).toBe(true);
  });
});
