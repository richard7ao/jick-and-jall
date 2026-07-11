import type { Dictionary, Locale } from "../../lib/i18n";
import { ButtonLink } from "../ui/button";

/**
 * Warm two-sided hero. CTAs deep-link to the waitlist with a preselected role.
 * Copy comes entirely from the bilingual dictionary — no copied third-party text.
 */
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const waitlist = (role: "creator" | "brand") => `/${locale}/waitlist?role=${role}`;
  return (
    <section aria-labelledby="hero-title" style={{ display: "grid", gap: "1.25rem" }}>
      <p style={{ color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.06em", margin: 0 }}>
        Jick &amp; Jall
      </p>
      <h1 id="hero-title" style={{ fontSize: "clamp(2.5rem, 7vw + 1rem, 6rem)", margin: 0 }}>
        {dict.hero.title}
      </h1>
      <p style={{ fontSize: "1.25rem", color: "var(--color-muted)", maxWidth: "52ch", margin: 0 }}>
        {dict.hero.subtitle}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <ButtonLink variant="primary" href={waitlist("creator")}>
          {dict.hero.creatorCta}
        </ButtonLink>
        <ButtonLink variant="accent" href={waitlist("brand")}>
          {dict.hero.brandCta}
        </ButtonLink>
      </div>
    </section>
  );
}
