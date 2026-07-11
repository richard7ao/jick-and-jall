import { getRepositories, markDealFunded } from "@jj/db";

import { fail, json } from "@/lib/server/api";
import { getStripe, webhookSecret } from "@/lib/server/stripe";

/**
 * Stripe webhook — the ONLY authority that funds a deal. The signature is
 * verified against the raw body; `checkout.session.completed` funds the deal
 * referenced in metadata via the idempotent reconciliation path.
 */
export async function POST(request: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = webhookSecret();
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return fail(400, "webhook not configured");

  const raw = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return fail(400, "invalid signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { dealId?: string } };
    const dealId = session.metadata?.dealId;
    if (dealId) await markDealFunded(getRepositories(), dealId, event.id);
  }
  return json({ received: true });
}
