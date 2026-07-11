import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/lib/i18n";
import type { MarketingContent } from "@/lib/marketing";

export function CtaSection({ locale, cta }: { locale: Locale; cta: MarketingContent["cta"] }) {
  return (
    <section className="border-t border-border py-16 md:py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-3xl font-black">{cta.title}</h2>
        <p className="max-w-[48ch] text-lg text-muted">{cta.subtitle}</p>
        <ButtonLink href={`/${locale}/waitlist`}>{cta.action}</ButtonLink>
      </Container>
    </section>
  );
}
