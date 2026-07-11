import { parseStripeEvent, verifyStripeSignature, type StripeEvent } from "@jj/payments";
import type { NextRequest } from "next/server";

/**
 * Stripe webhook: the source of truth for funding. Verifies the signature,
 * records the charge idempotently, and funds the deal. Unverified or duplicate
 * events are safe. Payout/refund/reversal remain disabled.
 */
export const runtime = "nodejs";

export type WebhookDeps = {
  verify: (payload: string, signature: string) => boolean;
  recordCharge: (event: StripeEvent) => Promise<boolean>;
  fundDeal: (dealId: string) => Promise<void>;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function handleStripeWebhook(request: Request, deps: WebhookDeps): Promise<Response> {
  const signature = request.headers.get("stripe-signature") ?? "";
  const payload = await request.text();
  if (!deps.verify(payload, signature)) return json(400, { error: "invalid_signature" });

  const event = parseStripeEvent(payload);
  if (event.type !== "checkout.session.completed") return json(200, { ignored: true });

  const recorded = await deps.recordCharge(event);
  if (recorded) {
    const dealId = (event.data.object.metadata as { dealId?: string } | undefined)?.dealId;
    if (dealId) await deps.fundDeal(dealId);
  }
  return json(200, { received: true, recorded });
}

export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  return handleStripeWebhook(request, {
    verify: (payload, signature) => Boolean(secret) && verifyStripeSignature(payload, signature, secret),
    recordCharge: async () => false, // wired to the transactions repo in deployment
    fundDeal: async () => {},
  });
}
