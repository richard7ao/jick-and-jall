# T2 — Marketing & Waitlist manual test guide

## Scope
Bilingual marketing landing and waitlist capture, plus admin invitation approval.

## Preconditions
- `pnpm install`
- Firebase emulator available: `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`
- Build web: `pnpm --filter @jj/web build`

## Automated verification
| Tier | Command |
| --- | --- |
| Unit (marketing) | `pnpm --filter @jj/web test --run tests/marketing` |
| Unit (waitlist UI) | `pnpm --filter @jj/web test --run tests/waitlist` |
| Unit (waitlist API) | `pnpm --filter @jj/web test --run tests/api/waitlist` |
| Unit (analytics) | `pnpm --filter @jj/web test --run tests/analytics` |
| Integration | `pnpm firebase:exec -- "pnpm test:integration:waitlist"` |
| E2E | `pnpm --filter @jj/web exec playwright test e2e/marketing-waitlist.spec.ts` |

## Manual checks (desktop + mobile, English + Spanish)
1. Landing renders warm palette, hero, and two role CTAs.
2. Creator/brand CTA deep-links to `/{locale}/waitlist?role=…` with the role preselected.
3. Submitting without consent shows an accessible error and makes no network call.
4. Submitting with consent shows the localized success state.
5. Language link switches en↔es and preserves layout.
6. Keyboard-only: skip link, focus order, visible focus ring.
7. Analytics never include email or free-form fields.

## Launch gate — G2.WAITLIST_APPROVAL
Human reviews the deployed English/Spanish waitlist on desktop and mobile, then
records the decision in `tasks/state-agent-1.json`. Automated tests cannot
approve this gate. Store any secret-bearing deploy URL outside task state.
