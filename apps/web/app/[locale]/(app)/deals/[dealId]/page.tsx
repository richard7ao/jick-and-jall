import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { DeliveryPanel } from "@/components/deliveries/delivery-panel";
import { OfferPanel } from "@/components/offers/offer-panel";
import { isLocale } from "@/lib/i18n";
import { getDealsCopy } from "@/lib/copy/deals";
import type { DealStatus } from "@/lib/deal-state";

const ROLES = new Set(["creator", "brand"]);
const STATUSES = new Set<DealStatus>([
  "draft",
  "offered",
  "accepted_by_one_party",
  "mutually_accepted",
  "funded",
  "delivered",
  "revision_requested",
  "approved",
  "payout_pending",
  "paid",
  "complete",
  "cancelled",
  "disputed",
]);

export default async function DealPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; dealId: string }>;
  searchParams: Promise<{ role?: string; status?: string }>;
}) {
  const { locale, dealId } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const role = sp.role && ROLES.has(sp.role) ? (sp.role as "creator" | "brand") : "brand";
  const status: DealStatus =
    sp.status && STATUSES.has(sp.status as DealStatus) ? (sp.status as DealStatus) : "funded";
  const copy = getDealsCopy(locale);

  return (
    <Container className="flex flex-col gap-6 py-10">
      <OfferPanel dealId={dealId} copy={copy} role={role} />
      <DeliveryPanel dealId={dealId} copy={copy} role={role} status={status} />
    </Container>
  );
}
