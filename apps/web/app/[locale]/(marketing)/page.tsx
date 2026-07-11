import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../../../lib/i18n";
import { Hero } from "../../../components/marketing/hero";

export default async function MarketingHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <div style={{ display: "grid", gap: "3rem" }}>
      <Hero locale={locale} dict={dict} />
      <section aria-labelledby="how" style={{ display: "grid", gap: "1rem" }}>
        <h2 id="how" style={{ margin: 0 }}>
          {dict.nav.howItWorks}
        </h2>
        <ol style={{ color: "var(--color-muted)", lineHeight: 1.8, paddingLeft: "1.2rem" }}>
          <li>{dict.hero.creatorCta} → Jick</li>
          <li>{dict.hero.brandCta} → Jall</li>
        </ol>
      </section>
      <p>
        <a href={`/${otherLocale}`} hrefLang={otherLocale}>
          {otherLocale === "es" ? "Ver en español" : "View in English"}
        </a>
      </p>
    </div>
  );
}
