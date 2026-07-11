import { notFound } from "next/navigation";

import { OpportunityList } from "@/components/matches/opportunity-list";
import { isLocale } from "@/lib/i18n";
import { getMatchesCopy } from "@/lib/copy/matches";

export default async function CreatorOpportunitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getMatchesCopy(locale);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black">{copy.creatorTitle}</h1>
        <p className="text-muted">{copy.creatorSubtitle}</p>
      </div>
      <OpportunityList copy={copy} />
    </div>
  );
}
