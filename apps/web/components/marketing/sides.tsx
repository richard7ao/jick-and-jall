import Link from "next/link";
import type { Route } from "next";
import type { Dictionary, Locale } from "../../lib/i18n";
import { Reveal } from "./reveal";

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="oklch(0.72 0.16 75 / 0.18)" />
      <path
        d="M6 10.5l2.5 2.5L14 7.5"
        stroke="oklch(0.44 0.14 60)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sides({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const s = dict.marketing.sides;
  const cards = [
    { key: "creator", data: s.creator, href: `/${locale}/waitlist?role=creator` as Route, pill: "pill-jick", btn: "btn-primary" },
    { key: "brand", data: s.brand, href: `/${locale}/waitlist?role=brand` as Route, pill: "pill-jall", btn: "btn-accent" },
  ] as const;

  return (
    <section className="section" aria-labelledby="sides-title">
      <div className="container">
        <Reveal className="sec-head">
          <h2 id="sides-title" className="sec-title">
            {s.title}
          </h2>
          <p className="sec-sub">{s.subtitle}</p>
        </Reveal>

        <div className="sides-grid">
          {cards.map((c, i) => (
            <Reveal key={c.key} delay={i * 90}>
              <article className={`side-card ${c.key}`} id={c.key === "creator" ? "creators" : "brands"}>
                <span className={`pill ${c.pill}`}>{c.data.tag}</span>
                <h3 className="side-title">{c.data.title}</h3>
                <p className="side-body">{c.data.body}</p>
                <ul className="side-points">
                  {c.data.points.map((p) => (
                    <li key={p}>
                      <Check />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link href={c.href} className={`btn ${c.btn}`}>
                  {c.data.cta}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
