import { notFound } from "next/navigation";
import { isLocale } from "../../../../../lib/i18n";
import { AppShell } from "../../../../../components/app-shell/app-shell";
import { OnboardingFlow } from "../../../../../components/onboarding/onboarding-flow";

export default async function CreatorOnboarding({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell role="creator" locale={locale}>
      <h1>{locale === "es" ? "Incorporación" : "Onboarding"}</h1>
      <OnboardingFlow locale={locale} />
    </AppShell>
  );
}
