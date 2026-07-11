import { notFound } from "next/navigation";
import { isLocale } from "../../../lib/i18n";
import { PageShell } from "../../../components/foundation/page-shell";

export default async function AuthGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PageShell locale={locale}>{children}</PageShell>;
}
