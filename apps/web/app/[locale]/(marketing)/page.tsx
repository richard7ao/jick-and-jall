import { notFound } from "next/navigation";

import { TrackEvent } from "@/components/analytics/track-event";
import { CtaSection } from "@/components/marketing/cta-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { TwoSided } from "@/components/marketing/two-sided";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { getMarketing } from "@/lib/marketing";

export default async function MarketingHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const marketing = getMarketing(locale);

  return (
    <>
      <TrackEvent event="marketing_view" props={{ locale }} />
      <SiteHeader locale={locale} nav={t.nav} />
      <main>
        <Hero locale={locale} hero={t.hero} />
        <HowItWorks howItWorks={marketing.howItWorks} />
        <TwoSided creator={marketing.creator} brand={marketing.brand} />
        <CtaSection locale={locale} cta={marketing.cta} />
      </main>
      <SiteFooter locale={locale} footer={t.footer} />
    </>
  );
}
