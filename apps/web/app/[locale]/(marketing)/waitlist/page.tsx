import { notFound } from "next/navigation";
import type { Role } from "@jj/shared";
import { getDictionary, isLocale } from "../../../../lib/i18n";
import { WaitlistForm } from "../../../../components/waitlist/waitlist-form";

export default async function WaitlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { role } = await searchParams;
  const dict = getDictionary(locale);
  const initialRole: Role = role === "brand" ? "brand" : "creator";
  const m = dict.marketing;

  return (
    <section className="section" aria-labelledby="waitlist-title">
      <div className="aurora" aria-hidden="true" style={{ opacity: 0.5 }} />
      <div className="container waitlist-grid">
        <div>
          <span className="pill pill-neutral">{m.hero.badge}</span>
          <h1 id="waitlist-title" className="hero-title" style={{ fontSize: "var(--text-4xl)", marginTop: "var(--space-6)" }}>
            {dict.waitlistForm.title}
          </h1>
          <p className="sec-sub" style={{ maxWidth: "44ch" }}>
            {dict.hero.subtitle}
          </p>
          <ul className="side-points" style={{ marginTop: "var(--space-8)" }}>
            {m.trust.pillars.slice(0, 3).map((p) => (
              <li key={p.title}>
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
                <span>{p.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <WaitlistForm locale={locale} dict={dict} initialRole={initialRole} />
      </div>
    </section>
  );
}
