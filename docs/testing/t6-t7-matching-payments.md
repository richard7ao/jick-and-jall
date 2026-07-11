# T6/T7 — Matching, consent, offers, and payments manual test guide

## Scope
Deterministic matching, consent-gated disclosure and chat, versioned offers, the
deal state machine, and Stripe test-mode funding with the integer ledger.

## Preconditions
- `pnpm install`; `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`.
- Stripe test key in `.env` (referenced only): `STRIPE_SECRET_KEY` (`sk_test_…`), `STRIPE_WEBHOOK_SECRET`.
- Build: `pnpm -r build`.

## Automated verification
| Tier | Command |
| --- | --- |
| Matching/deals/payments (unit) | `pnpm --filter @jj/agents test --run && pnpm --filter @jj/payments test --run` |
| Matches/inbox/stripe APIs (unit) | `pnpm --filter @jj/web test --run tests/api/matches tests/api/inbox tests/api/stripe` |
| Deals persistence (integration) | `pnpm firebase:exec -- "pnpm test:integration:deals"` |

## Manual checks
1. Matching returns only registered/published/available creators, ranked deterministically; scores are stable across runs.
2. A creator must consent before a brand sees contact details or can message (English + Spanish).
3. A thread opens only from a consented match; non-participants are blocked.
4. Offer terms show creator amount, 10% fee, and total; the brand pays amount + 10%.
5. Test-mode funding transitions the deal to funded via the webhook exactly once (idempotent on redelivery).
6. Payout/refund/reversal are disabled and never move funds automatically.
