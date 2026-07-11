import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../../../lib/i18n";
import { Hero } from "../../../components/marketing/hero";
import { Marquee } from "../../../components/marketing/marquee";
import { Sides } from "../../../components/marketing/sides";
import { HowItWorks } from "../../../components/marketing/how-it-works";
import { Trust } from "../../../components/marketing/trust";
import { Faq } from "../../../components/marketing/faq";
import { CtaBand } from "../../../components/marketing/cta-band";

export default async function MarketingHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Marquee dict={dict} />
      <Sides locale={locale} dict={dict} />
      <HowItWorks dict={dict} />
      <Trust dict={dict} />
      <Faq dict={dict} />
      <CtaBand locale={locale} dict={dict} />
    </>
  );
}
