import { notFound } from "next/navigation";

import { CampaignIntake } from "@/components/jall/campaign-intake";
import { isLocale } from "@/lib/i18n";
import { getJallCopy } from "@/lib/copy/jall";

export default async function BrandOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CampaignIntake locale={locale} copy={getJallCopy(locale)} />;
}
