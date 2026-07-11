import en from "../../../content/en.json";
import es from "../../../content/es.json";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Pick the best supported locale from an Accept-Language header value. */
export function resolveLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  for (const part of acceptLanguage.split(",")) {
    const tag = part.trim().split(";")[0]?.toLowerCase() ?? "";
    const base = tag.split("-")[0] ?? "";
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
