import type { CSSProperties } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Dictionary, Locale } from "../../lib/i18n";
import { VoiceVisual } from "./voice-visual";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * Warm, enterprise-grade hero. CTAs deep-link to the waitlist with a
 * preselected role; the animated visual dramatizes the two-sided voice match.
 * Copy comes entirely from the bilingual dictionary — no copied third-party text.
 */
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const m = dict.marketing.hero;
  const waitlist = (role: "creator" | "brand") => `/${locale}/waitlist?role=${role}` as Route;

  return (
    <section aria-labelledby="hero-title" className="hero">
      <div className="aurora" aria-hidden="true" />
      <div className="container hero-grid">
        <div>
          <span className="hero-badge rise" style={delay(0)}>
            <span className="dot" aria-hidden="true" />
            {m.badge}
          </span>

          <h1 id="hero-title" className="hero-title rise" style={delay(80)}>
            {m.titleLead}
            <span className="em">{m.titleEmphasis}</span>
          </h1>

          <p className="hero-sub rise" style={delay(170)}>
            {dict.hero.subtitle}
          </p>

          <div className="hero-actions rise" style={delay(250)}>
            <Link href={waitlist("creator")} className="btn btn-primary btn-lg">
              {dict.hero.creatorCta}
            </Link>
            <Link href={waitlist("brand")} className="btn btn-accent btn-lg">
              {dict.hero.brandCta}
            </Link>
          </div>

          <p className="hero-note rise" style={delay(330)}>
            {m.note}
          </p>
        </div>

        <div className="rise" style={delay(200)}>
          <VoiceVisual dict={dict} />
        </div>
      </div>
    </section>
  );
}
