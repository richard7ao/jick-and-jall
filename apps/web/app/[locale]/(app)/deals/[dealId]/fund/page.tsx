import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { FundButton } from "@/components/payments/fund-button";
import { isLocale } from "@/lib/i18n";
import { getDealsCopy } from "@/lib/copy/deals";

export default async function FundDealPage({
  params,
}: {
  params: Promise<{ locale: string; dealId: string }>;
}) {
  const { locale, dealId } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDealsCopy(locale);
  return (
    <Container className="flex max-w-lg flex-col gap-6 py-10">
      <h1 className="font-display text-3xl font-black">{copy.fundTitle}</h1>
      <FundButton dealId={dealId} copy={copy} />
    </Container>
  );
}
