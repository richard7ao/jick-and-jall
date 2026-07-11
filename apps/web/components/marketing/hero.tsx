import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function Hero({ locale, hero }: { locale: Locale; hero: Dictionary["hero"] }) {
  return (
    <section className="overflow-hidden">
      <Container className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <h1
            data-testid="hero-title"
            className="font-display text-4xl font-black leading-[1.05] sm:text-5xl"
          >
            {hero.title}
          </h1>
          <p className="max-w-[46ch] text-lg text-muted">{hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/${locale}/waitlist?role=creator`}>{hero.creatorCta}</ButtonLink>
            <ButtonLink href={`/${locale}/waitlist?role=brand`} variant="accent">
              {hero.brandCta}
            </ButtonLink>
          </div>
        </div>
        <img
          src="/marketing/hero.svg"
          alt=""
          aria-hidden
          className="w-full max-w-md justify-self-center md:justify-self-end"
          width={480}
          height={420}
        />
      </Container>
    </section>
  );
}
