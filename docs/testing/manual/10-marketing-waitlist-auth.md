# 10 — Marketing, Waitlist & Auth

Covers the public surface and invitation-gated authentication.
Automated: `e2e/marketing.spec.ts`, `e2e/waitlist-ui.spec.ts`,
`e2e/marketing-waitlist.spec.ts`.

## Steps

1. Visit `/` → redirected to a locale (`/en` or `/es`).
2. Marketing page shows hero, how-it-works, two-sided section, CTA (both langs).
3. `Join the waitlist` → waitlist form.
4. Submit empty → role/email/consent errors, no network call.
5. Submit valid (role + email + consent) → success message.
6. Confirm analytics payloads contain no email/name/handle (Network tab).
7. `/en/sign-in` → email/password + Google; wrong details show a single generic,
   enumeration-safe error.
8. `/en/register` requires an invitation code; success shows a neutral message.
9. `/en/recover` always shows the neutral "if that account exists" message.

## Expected

- English/Spanish equivalent; mobile layout holds; no console errors.
- Auth errors never reveal whether an account or invite exists.
