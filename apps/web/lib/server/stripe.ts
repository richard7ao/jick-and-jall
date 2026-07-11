import Stripe from "stripe";

/**
 * Lazily-created Stripe client. Returns null when no key is configured so the
 * app degrades safely (no charge attempted) in dev/test. Test mode is enforced
 * by the key; live payments stay behind the separate operational gate.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export function webhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}
