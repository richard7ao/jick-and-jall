import type { Dictionary } from "../../lib/i18n";
import { Reveal } from "./reveal";

const ICONS = [
  // shield / consent
  "M12 2l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V5l7-3z",
  // lock / private
  "M6 10V8a6 6 0 1112 0v2M5 10h14v10H5V10z",
  // coin / pricing
  "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v10M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4",
  // globe / bilingual
  "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z",
];

export function Trust({ dict }: { dict: Dictionary }) {
  const t = dict.marketing.trust;
  return (
    <section className="section trust" aria-labelledby="trust-title">
      <div className="container">
        <Reveal className="sec-head">
          <h2 id="trust-title" className="sec-title">
            {t.title}
          </h2>
          <p className="sec-sub">{t.subtitle}</p>
        </Reveal>

        <div className="trust-grid">
          {t.pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 80}>
              <div className="pillar-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d={ICONS[i % ICONS.length]}
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-body">{pillar.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="kicker" style={{ marginTop: "var(--space-16)" }}>
            {dict.marketing.audiencesTitle}
          </p>
          <div className="aud-strip">
            {dict.marketing.audiences.map((a) => (
              <span className="aud-chip" key={a}>
                {a}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
