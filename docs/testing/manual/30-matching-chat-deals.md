# 30 — Matching, Chat & Deals

Covers matching + consent, inbox/chat, offers, funding, and delivery.
Automated: `e2e/match-consent.spec.ts`, `e2e/introduction-chat.spec.ts`,
`e2e/offer-versioning.spec.ts`, `e2e/connect-funding-status.spec.ts`,
`e2e/complete-test-deal.spec.ts`.

## Steps

1. Brand `/en/brand/matches` → fit-reason previews, **no numeric scores** and no
   full creator catalog; status shows "waiting for the creator to accept".
2. Creator `/en/creator/opportunities` → accept an opportunity → contact-revealed
   confirmation; decline → declined state.
3. `/en/inbox` → conversations list (empty state until a match is accepted);
   open a conversation and send a message (optimistic delivery, links render).
4. In a deal (`/en/deals/<id>?role=brand&status=offered`), send an offer; the
   charge breakdown shows creator amount + 10%. Send again → v2 in history.
5. `/en/settings/payouts` → set up payouts when not ready.
6. `/en/deals/<id>/fund` → funding note states the server (not the return page)
   confirms payment.
7. Delivery: creator submits on a funded deal → "Delivered"; brand approves →
   "Approved" (or requests a revision).

## Expected

- Consent gates disclosure; money math is deterministic; payments are test-mode.
