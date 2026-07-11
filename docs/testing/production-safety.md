# Production-safe operations manual test guide

## Scope
Running and testing major capabilities without unsafe production mutations, and
the boundaries that keep live money and private data safe.

## Preconditions
- `pnpm install`; `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`.
- Use the `demo-jj` emulator for all data operations; never point tests at production.

## Automated verification
| Tier | Command |
| --- | --- |
| Coordination/content (unit) | `pnpm state:validate && pnpm content:validate && pnpm guides:validate` |
| Full unit suite | `pnpm vitest run` |
| Emulator integration | `pnpm firebase:exec -- "pnpm test:integration:waitlist"` |

## Manual checks
1. Stripe stays in test mode (`sk_test_…`); payout/refund/reversal are disabled and cannot be triggered from the UI or API.
2. Firestore/Storage default-deny rules block direct client access; writes go through server repositories only.
3. Voice recordings are private, 90-day retention; the retention purge is idempotent and safe to re-run.
4. No secrets, tokens, signed URLs, or personal data appear in logs, state files, receipts, or screenshots.
5. Destructive/admin scripts require explicit allowlisting and never run automatically in CI.
6. Deploy evidence records only a safe origin and an evidence hash (secrets stored outside task state).
