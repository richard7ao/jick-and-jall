import type { ReactNode } from "react";
import type { Locale } from "../../lib/i18n";

/**
 * Minimal shared layout frame for the bilingual foundation: a centered,
 * responsive content column with a skip link for keyboard/screen-reader users.
 */
export function PageShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div data-locale={locale} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <a
        href="#main"
        style={{
          position: "absolute",
          left: "-9999px",
        }}
      >
        Skip to content
      </a>
      <main
        id="main"
        style={{
          flex: 1,
          width: "min(72rem, 100% - 2rem)",
          marginInline: "auto",
          paddingBlock: "clamp(2rem, 6vw, 5rem)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
