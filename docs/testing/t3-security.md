# T3 — Auth, sessions, and media security manual test guide

## Scope
Invitation-gated registration, immutable roles, secure sessions, CSRF, and
owner/admin private-media authorization.

## Preconditions
- `pnpm install`; `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`.
- Build: `pnpm --filter @jj/auth build && pnpm --filter @jj/web build`.

## Automated verification
| Tier | Command |
| --- | --- |
| Auth primitives (unit) | `pnpm --filter @jj/auth test --run` |
| Auth/media APIs (unit) | `pnpm --filter @jj/web test --run tests/api/auth tests/api/media` |
| Firestore rules (integration) | `pnpm firebase:exec -- "pnpm --filter @jj/test-support test:rules"` |

## Manual checks
1. Only an invited email can register; the invitation is single-use and expires; role is fixed at creation.
2. There is no role switcher; a person needing both roles uses two accounts (English + Spanish).
3. Session cookies are HTTP-only, SameSite, Secure; revocation clears the session; CSRF-less state changes are rejected.
4. Private media returns an indistinguishable 404 for denied and missing; raw Storage paths are never exposed.
5. Keyboard-only auth flows and screen-reader labels work; focus is visible.
