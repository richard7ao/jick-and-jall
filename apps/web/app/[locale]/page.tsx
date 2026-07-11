import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../../lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <section>
      <p style={{ color: "var(--color-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>
        Jick &amp; Jall
      </p>
      <h1 style={{ fontSize: "clamp(2.5rem, 7vw + 1rem, 6rem)", margin: "0.5rem 0 1rem" }}>
        {dict.hero.title}
      </h1>
      <p style={{ fontSize: "var(--text-lg, 1.25rem)", color: "var(--color-muted)", maxWidth: "48ch" }}>
        {dict.hero.subtitle}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <span
          style={{
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius)",
            fontWeight: 700,
          }}
        >
          {dict.hero.creatorCta}
        </span>
        <span
          style={{
            background: "var(--color-accent)",
            color: "var(--color-on-accent)",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius)",
            fontWeight: 700,
          }}
        >
          {dict.hero.brandCta}
        </span>
      </div>
      <p style={{ marginTop: "3rem" }}>
        <a href={`/${otherLocale}`} hrefLang={otherLocale}>
          {otherLocale === "es" ? "Ver en español" : "View in English"}
        </a>
      </p>
    </section>
  );
}
