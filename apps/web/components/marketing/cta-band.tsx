import Link from "next/link";
import type { Route } from "next";
import type { Dictionary, Locale } from "../../lib/i18n";
import { Reveal } from "./reveal";

export function CtaBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.marketing.cta;
  return (
    <section className="section" aria-labelledby="cta-title">
      <div className="container">
        <Reveal>
          <div className="cta-band">
            <div className="aurora" aria-hidden="true" />
            <h2 id="cta-title" className="cta-title">
              {c.title}
            </h2>
            <p className="cta-body">{c.body}</p>
            <div className="cta-actions">
              <Link href={`/${locale}/waitlist?role=creator` as Route} className="btn btn-primary btn-lg">
                {c.creator}
              </Link>
              <Link href={`/${locale}/waitlist?role=brand` as Route} className="btn btn-on-deep btn-lg">
                {c.brand}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
