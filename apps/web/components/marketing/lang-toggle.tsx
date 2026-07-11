"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "../../lib/i18n";

const LABELS: Record<Locale, string> = { en: "EN", es: "ES" };

/** Switches locale in place by swapping the leading path segment. */
export function LangToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;

  const hrefFor = (target: Locale) => {
    const segments = pathname.split("/");
    // segments[0] is "" (leading slash); segments[1] is the current locale.
    if (segments.length > 1 && (locales as readonly string[]).includes(segments[1] ?? "")) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    return (segments.join("/") || `/${target}`) as Route;
  };

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {locales.map((l) => (
        <Link key={l} href={hrefFor(l)} aria-current={l === locale ? "true" : undefined} hrefLang={l}>
          {LABELS[l]}
        </Link>
      ))}
    </div>
  );
}
