/**
 * Locale primitives for the bilingual (English/Spanish) web app.
 *
 * Routing, negotiation and validation are deterministic TypeScript — the model
 * never decides which locale a request gets.
 */

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Pick the best supported locale from an Accept-Language header value.
 * Falls back to {@link defaultLocale} when nothing matches.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: (tag ?? "").toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0] ?? "";
    if (isLocale(primary)) return primary;
  }
  return defaultLocale;
}

/** Split a pathname into its leading locale segment (if any) and the rest. */
export function splitLocale(pathname: string): {
  locale: Locale | null;
  rest: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first)) {
    return { locale: first, rest: `/${segments.slice(1).join("/")}` };
  }
  return { locale: null, rest: pathname };
}
