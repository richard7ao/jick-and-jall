import { getRepositories } from "@jj/db";
import { requireRole } from "@jj/auth";

import { getSession, handleError, json } from "@/lib/server/api";
import { getStripe } from "@/lib/server/stripe";

// Creates a Stripe Checkout Session for the brand charge (creator amount + 10%).
// Payment is confirmed later by the server via the webhook, never by the return
// page. With no deal or no configured Stripe key, no charge is attempted.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ dealId: string }> },
): Promise<Response> {
  try {
    requireRole(await getSession(), "brand");
    const { dealId } = await params;
    const deal = await getRepositories().deals.getById(dealId);
    const stripe = getStripe();
    if (!deal || !stripe) return json({});

    const origin = new URL(request.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: deal.brandChargeMinor,
            product_data: { name: `Campaign deal ${dealId}` },
          },
        },
      ],
      metadata: { dealId },
      success_url: `${origin}/en/deals/${dealId}`,
      cancel_url: `${origin}/en/deals/${dealId}/fund`,
    });
    return json({ url: checkout.url });
  } catch (error) {
    return handleError(error);
  }
}
