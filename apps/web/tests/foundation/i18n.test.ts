import { describe, expect, it } from "vitest";
import { defaultLocale, getDictionary, isLocale, locales, resolveLocale } from "../../lib/i18n";

function leafKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>)
    .flatMap(([k, v]) => leafKeys(v, prefix ? `${prefix}.${k}` : k))
    .sort();
}

describe("i18n", () => {
  it("recognizes supported locales only", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("resolves Accept-Language to a supported locale, defaulting safely", () => {
    expect(resolveLocale("es-ES,es;q=0.9,en;q=0.8")).toBe("es");
    expect(resolveLocale("en-GB,en;q=0.9")).toBe("en");
    expect(resolveLocale("fr-FR")).toBe(defaultLocale);
    expect(resolveLocale(null)).toBe(defaultLocale);
  });

  it("keeps English and Spanish dictionaries at structural parity", () => {
    const en = leafKeys(getDictionary("en"));
    const es = leafKeys(getDictionary("es"));
    expect(es).toEqual(en);
  });

  it("stamps each dictionary with its own locale", () => {
    for (const locale of locales) {
      expect(getDictionary(locale).meta.locale).toBe(locale);
    }
  });
});
