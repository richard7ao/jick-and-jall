import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "../../../lib/i18n";
import { SmoothScroll } from "../../../components/marketing/smooth-scroll";
import { SiteNav } from "../../../components/marketing/site-nav";
import { SiteFooter } from "../../../components/marketing/site-footer";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <SmoothScroll>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteNav locale={locale} dict={dict} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} dict={dict} />
    </SmoothScroll>
  );
}
