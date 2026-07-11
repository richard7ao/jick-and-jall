# T2 Manual Test — Marketing & Waitlist Launch Surface

Manual acceptance guide for the public launch surface (marketing + waitlist)
before the `G2.WAITLIST_APPROVAL` human gate. Automated coverage lives in
`apps/web/e2e/marketing-waitlist.spec.ts`, `e2e/marketing.spec.ts`, and
`e2e/waitlist-ui.spec.ts`; this document covers what a human must confirm.

## Prerequisites

- Node 22, pnpm 10, `pnpm install --frozen-lockfile`.
- `pnpm --filter @jj/web dev` (or a deployed preview URL).
- Test on desktop and on a mobile viewport (e.g. iPhone / Pixel width).

## Scenarios

### 1. Marketing story renders in both languages

1. Visit `/` — you are redirected to `/en` (or your Accept-Language match).
2. Confirm the hero, "How it works" (3 steps), the two-sided creator/brand
   section, and the final CTA all render with imagery (no empty boxes).
3. Visit `/es` and confirm the same structure with Spanish copy and
   `<html lang="es">`.

Expected: English and Spanish are behaviorally identical; layout holds at
mobile width; no console errors.

### 2. Waitlist capture

1. From the marketing page, click "Join the waitlist".
2. Submit the empty form — confirm inline errors for role, email, and consent,
   and that no network request is made.
3. Choose a role, enter a valid email, tick consent, submit.
4. Confirm the success message appears.
5. Repeat in Spanish (`/es/waitlist`).
6. Deep link `/(en|es)/waitlist?role=brand` — confirm "Brand" is preselected.

Expected: only role + email + consent are required; website/handle is optional;
keyboard-only users can complete the form (Tab/Arrow keys move through the role
radios).

### 3. Privacy of analytics

1. Open dev tools → Network, filter `analytics`.
2. Complete the waitlist flow.
3. Inspect each `/api/analytics` payload.

Expected: payloads contain only non-identifying keys (`event`, `role`,
`locale`, `ts`) — never email, name, or handle. With Do-Not-Track enabled, no
analytics requests are sent at all.

## Deploy evidence checklist (for the human gate)

- [ ] `pnpm --filter @jj/web build` succeeds.
- [ ] `pnpm --filter @jj/web test` passes.
- [ ] `pnpm --filter @jj/web exec playwright test` passes (marketing, waitlist,
      foundation, marketing-waitlist journey).
- [ ] Deployed preview reviewed on desktop and mobile in English and Spanish.
- [ ] Screenshots captured for the approval record (no secrets/PII in frame).

`G2.WAITLIST_APPROVAL` is recorded only after a human reviews the deployed
English/Spanish waitlist. Tests cannot approve it.
