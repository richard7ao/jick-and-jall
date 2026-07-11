import { notFound } from "next/navigation";

import { CampaignEditor } from "@/components/brand-editors/campaign-editor";
import { isLocale } from "@/lib/i18n";
import { getBrandEditorsCopy } from "@/lib/copy/brand-editors";

export default async function BrandCampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getBrandEditorsCopy(locale);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-3xl font-black">{copy.campaignTitle}</h1>
      <CampaignEditor locale={locale} copy={copy} />
    </div>
  );
}
