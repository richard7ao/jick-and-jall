import { notFound } from "next/navigation";
import { isLocale } from "../../../../../lib/i18n";
import { AppShell } from "../../../../../components/app-shell/app-shell";
import { BrandOnboarding } from "../../../../../components/jall/brand-onboarding";

export default async function BrandOnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell role="brand" locale={locale}>
      <h1>{locale === "es" ? "Incorporación" : "Onboarding"}</h1>
      <BrandOnboarding locale={locale} />
    </AppShell>
  );
}
