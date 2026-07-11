import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { PayoutSetup } from "@/components/payments/payout-setup";
import { isLocale } from "@/lib/i18n";
import { getDealsCopy } from "@/lib/copy/deals";

export default async function PayoutsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getDealsCopy(locale);
  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-10">
      <h1 className="font-display text-3xl font-black">{copy.payoutsTitle}</h1>
      <PayoutSetup copy={copy} />
    </Container>
  );
}
