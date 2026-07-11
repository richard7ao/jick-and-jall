import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, isLocale, locales } from "../../lib/i18n";
import { PageShell } from "../../components/foundation/page-shell";

export const metadata: Metadata = {
  title: "Jick & Jall",
  description: "Creators and brands, matched by voice.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={dict.meta.dir}>
      <body>
        <PageShell locale={locale}>{children}</PageShell>
      </body>
    </html>
  );
}
