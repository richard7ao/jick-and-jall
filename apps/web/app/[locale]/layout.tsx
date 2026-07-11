import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, isLocale, locales } from "../../lib/i18n";

export const metadata: Metadata = {
  title: "Jick & Jall — Creators and brands, matched by voice",
  description:
    "Jick voice-interviews creators and Jall briefs brands, then a match engine ranks the fit. No cold outreach, no spreadsheets, no guesswork.",
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
      <body>{children}</body>
    </html>
  );
}
