# T4/T5 — Jick & Jall onboarding manual test guide

## Scope
Creator (Jick) voice/text onboarding and profile management, and brand (Jall)
campaign intake and publishing.

## Preconditions
- `pnpm install`; `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`.
- Provider keys present in `.env` (referenced only): `SUPERLINKED_*`, `ELEVENLABS_API_KEY`.
- Build: `pnpm -r build`.

## Automated verification
| Tier | Command |
| --- | --- |
| Providers (unit) | `pnpm --filter @jj/voice test --run && pnpm --filter @jj/agents test --run` |
| Jick/Jall APIs (unit) | `pnpm --filter @jj/web test --run tests/api/jick tests/api/jall` |
| Creator/brand UI (unit) | `pnpm --filter @jj/web test --run tests/onboarding tests/creator-profile tests/components/jall tests/components/brand-editors` |
| Persistence (integration) | `pnpm firebase:exec -- "pnpm test:integration:jall"` |

## Manual checks
1. Creator can complete onboarding by voice; a voice failure falls back to text with progress preserved (English + Spanish).
2. Creator profile edits persist; publish/available toggles gate ranking eligibility.
3. Recordings can be played and deleted; deletion propagates upstream; export returns metadata only (no recordings).
4. Brand can describe a campaign and create a draft, then edit and publish it (English + Spanish, desktop + mobile).
5. Keyboard-only navigation and screen-reader labels work on all onboarding forms.
