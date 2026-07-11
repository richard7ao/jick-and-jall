# 00 — Environments & Safety

## Environments

| Env | URL | Data | Payments |
| --- | --- | --- | --- |
| Local | `pnpm --filter @jj/web dev` | Firebase emulator (`demo-jj`) | Stripe test mode |
| Staging | preview deploy | isolated staging project | Stripe test mode |
| Production | live | production project | Stripe test mode until live gate |

## Accounts

- Use a **separate creator account and brand account** (different emails). Roles
  are immutable; there is no role switcher.
- Invitation codes are required to register during early access.

## Absolute safety rules

- Never run destructive operations against production data.
- Live automatic payout, refund, reversal, and dispute resolution stay disabled.
- Recordings are private, default to 90-day retention; deleting a session must
  propagate upstream.
- No secret or personal content in notes, screenshots, or committed evidence.
