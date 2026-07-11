## Decisions

- [2026-07-11] Next.js 14 App Router chosen for SSR landing SEO + RSC in app — single Vercel deployment
- [2026-07-11] pnpm workspaces + turbo for monorepo — shared types via packages/shared, no version drift
- [2026-07-11] Firebase Auth + Firestore — phone auth built-in, generous free tier, real-time subs
- [2026-07-11] ElevenLabs Conversational AI for Jick and Jall voice agents — native interview SDK
- [2026-07-11] Hermes as Node/TS agent harness — same language as frontend, types shared
- [2026-07-11] Embedding provider kept internal/undisclosed per product philosophy
- [2026-07-11] OKLCH color tokens — perceptually uniform, better dark mode math than HSL
- [2026-07-11] Marketing + waitlist as primary surface (T2) before app (T3+) — validate before building
- [2026-07-11] Jick = creator-side agent (builds creator profile); Jall = brand-side agent (builds campaign brief)
- [2026-07-11] Register: brand (marketing/waitlist primary surface, app behind auth)
- [2026-07-11] Brand personality: Bold, playful, fast — creator economy speed, not corporate SaaS
- [2026-07-11] Anti-references: Generic SaaS aesthetic, influencer marketplaces (AspireIQ/Grin style)
- [2026-07-11] Full qualification waitlist: creator (platforms, follower range, rates) + brand (budget, campaign type)
- [2026-07-11] Both sides get voice agent onboarding: Jick for creator profile, Jall for brand brief

## Patterns

- [2026-07-11] Monorepo structure: apps/web (Next.js), packages/agents (Hermes), packages/db, packages/auth, packages/voice, packages/shared
- [2026-07-11] Zod schemas in packages/shared define all data shapes — used in agents, API routes, and frontend
- [2026-07-11] Firebase emulator (`demo-jj` project) used for all integration tests — no live Firebase in CI
- [2026-07-11] All UI files verified with impeccable detect.mjs as Tier 2 in every UI stage

## Gotchas

- [2026-07-11] ElevenLabs integration tests require ELEVENLABS_API_KEY + audio device — skip in CI, manual QA only
- [2026-07-11] Firebase phone verification requires real phone in production; emulator accepts any number
- [2026-07-11] Hermes package name TBD — confirm npm package name before T4.2.1 (may be `hermes-agent` or sourced differently)
- [2026-07-11] Next.js middleware cannot use firebase-admin directly — use session cookies + server-side validation

## Open Questions

- [2026-07-11] Confirm Hermes npm package name / installation method before T4.2.1
- [2026-07-11] Embedding provider decision (OpenAI vs Voyage AI vs other) — finalize before T6.1.1
- [2026-07-11] Slack / Ashby integrations (from Jack & Jill original) — not in scope for v1, revisit post-T7
- [2026-07-11] Whether to support both creator and brand roles on a single Firebase Auth account
- [2026-07-11] Rate/budget data sensitivity — decide if stored in Firestore or kept encrypted separately
