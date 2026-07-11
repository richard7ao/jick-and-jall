import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stripe webhook signature verification (the `t=…,v1=…` scheme) implemented with
 * Node crypto so no SDK is required. The webhook is the source of truth for
 * payment state; unverified payloads are rejected.
 */
export function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim() ?? "", v?.trim() ?? ""];
    }),
  );
  const timestamp = Number(parts.t);
  const provided = parts.v1;
  if (!Number.isFinite(timestamp) || !provided) return false;
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };

export function parseStripeEvent(payload: string): StripeEvent {
  return JSON.parse(payload) as StripeEvent;
}
