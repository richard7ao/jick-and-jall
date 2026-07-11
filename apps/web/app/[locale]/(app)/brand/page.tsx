import { notFound } from "next/navigation";
import { isLocale } from "../../../../lib/i18n";
import { AppShell } from "../../../../components/app-shell/app-shell";

export default async function BrandHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell role="brand" locale={locale}>
      <h1>{locale === "es" ? "Panel de la marca" : "Brand dashboard"}</h1>
    </AppShell>
  );
}
