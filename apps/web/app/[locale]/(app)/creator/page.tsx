import { notFound } from "next/navigation";
import { isLocale } from "../../../../lib/i18n";
import { AppShell } from "../../../../components/app-shell/app-shell";

export default async function CreatorHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell role="creator" locale={locale}>
      <h1>{locale === "es" ? "Panel del creador" : "Creator dashboard"}</h1>
    </AppShell>
  );
}
