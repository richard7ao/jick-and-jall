// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { handleStripeWebhook, type WebhookDeps } from "../../../app/api/stripe/webhook/route";

function req(payload: unknown, signature = "sig"): Request {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const completed = { id: "evt_1", type: "checkout.session.completed", data: { object: { metadata: { dealId: "d1" } } } };

function deps(overrides: Partial<WebhookDeps> = {}): WebhookDeps {
  return {
    verify: () => true,
    recordCharge: async () => true,
    fundDeal: async () => {},
    ...overrides,
  };
}

describe("stripe webhook", () => {
  it("rejects an invalid signature", async () => {
    const res = await handleStripeWebhook(req(completed), deps({ verify: () => false }));
    expect(res.status).toBe(400);
  });

  it("records the charge and funds the deal on checkout.session.completed", async () => {
    const fundDeal = vi.fn(async () => {});
    const res = await handleStripeWebhook(req(completed), deps({ fundDeal }));
    expect(res.status).toBe(200);
    expect(fundDeal).toHaveBeenCalledWith("d1");
  });

  it("is idempotent: a duplicate event does not re-fund", async () => {
    const fundDeal = vi.fn(async () => {});
    await handleStripeWebhook(req(completed), deps({ recordCharge: async () => false, fundDeal }));
    expect(fundDeal).not.toHaveBeenCalled();
  });

  it("ignores unrelated event types", async () => {
    const res = await handleStripeWebhook(req({ id: "e", type: "payment_intent.created", data: { object: {} } }), deps());
    expect(await res.json()).toEqual({ ignored: true });
  });
});
