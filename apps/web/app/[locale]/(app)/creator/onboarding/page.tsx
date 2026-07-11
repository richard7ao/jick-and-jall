import { notFound } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { isLocale } from "@/lib/i18n";
import { getOnboardingCopy } from "@/lib/copy/onboarding";

export default async function CreatorOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <OnboardingFlow locale={locale} copy={getOnboardingCopy(locale)} />;
}
