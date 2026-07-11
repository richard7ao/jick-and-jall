import { notFound } from "next/navigation";
import { isLocale } from "../../../../../lib/i18n";
import { AppShell } from "../../../../../components/app-shell/app-shell";
import { CampaignEditor } from "../../../../../components/brand-editors/campaign-editor";

export default async function BrandCampaignsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell role="brand" locale={locale}>
      <h1>{locale === "es" ? "Campañas" : "Campaigns"}</h1>
      <CampaignEditor locale={locale} initial={{ title: "", brief: "", status: "draft" }} />
    </AppShell>
  );
}
