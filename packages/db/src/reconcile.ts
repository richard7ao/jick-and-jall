import type { Repositories } from "./repositories.js";

/**
 * Reconcile a completed payment against a deal. Idempotent: a duplicate webhook
 * (same Stripe reference) is a no-op, and an already-funded deal is not
 * re-transitioned. This is the only path that moves a deal to `funded` — it is
 * driven by the server-verified webhook, never by a browser return URL.
 */
export async function markDealFunded(
  repos: Repositories,
  dealId: string,
  reference: string,
): Promise<"funded" | "already_funded" | "duplicate" | "unknown_deal"> {
  if (await repos.ledger.hasReference(reference)) return "duplicate";

  const deal = await repos.deals.getById(dealId);
  if (!deal) return "unknown_deal";
  if (deal.status === "funded") return "already_funded";

  await repos.deals.transition(dealId, "funded");
  await repos.ledger.append({
    dealId,
    kind: "charge",
    amountMinor: deal.brandChargeMinor,
    reference,
  });
  return "funded";
}
