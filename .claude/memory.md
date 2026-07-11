## Decisions

- [2026-07-11] Superseded by approved v1: the initial Next.js 14 choice was replaced by Next.js 16 on Node.js 22
- [2026-07-11] pnpm workspaces + turbo for monorepo — shared types via packages/shared, no version drift
- [2026-07-11] Superseded by approved v1: Firebase remains the backend, but authentication uses Google plus email/password rather than phone
- [2026-07-11] ElevenLabs Conversational AI for Jick and Jall voice agents — native interview SDK
- [2026-07-11] Superseded by approved v1: Hermes is developer-side evidence/backup and is not the production TypeScript orchestrator
- [2026-07-11] Superseded by approved v1: Superlinked SIE is the named primary generation and embedding provider
- [2026-07-11] OKLCH color tokens — perceptually uniform, better dark mode math than HSL
- [2026-07-11] Marketing + waitlist as primary surface (T2) before app (T3+) — validate before building
- [2026-07-11] Jick = creator-side agent (builds creator profile); Jall = brand-side agent (builds campaign brief)
- [2026-07-11] Register: brand (marketing/waitlist primary surface, app behind auth)
- [2026-07-11] Brand personality: Bold, playful, fast — creator economy speed, not corporate SaaS
- [2026-07-11] Anti-references: Generic SaaS aesthetic, influencer marketplaces (AspireIQ/Grin style)
- [2026-07-11] Superseded by approved v1: waitlist requires only role, email, and consent; all qualification details are optional
- [2026-07-11] Both sides get voice agent onboarding: Jick for creator profile, Jall for brand brief
- [2026-07-11] Approved v1 supersedes the earlier foundation choices: Next.js 16 on Node.js 22, Google sign-in plus email/password, and no phone-auth flow
- [2026-07-11] Superlinked SIE is the primary generation/embedding provider; Hermes is a developer-side coding partner and backup rather than production orchestration
- [2026-07-11] Creator and brand roles require separate Firebase accounts with different emails and immutable single roles
- [2026-07-11] Firebase Auth, Firestore, and private Storage are the only v1 backend; route handlers own APIs and provider/webhook boundaries
- [2026-07-11] V3 coordination uses a stable global schedule plus isolated Agent 1 and Agent 2 runtime journals; readiness and aggregate progress are derived
- [2026-07-11] The executable catalog has 41 stages balanced at Agent 1 weight 116 and Agent 2 weight 121
- [2026-07-11] Per user override, T0 was built directly on `main` (no feature branches) from a single machine; owner-accurate completion still recorded in each agent runtime file
- [2026-07-11] Root package.json defines the full pnpm script surface for T0 (state:*, bootstrap:check, content:*, hermes:*) because later T0 stages do not own package.json
- [2026-07-11] Tier 2 named reviewer `code-simplifier:code-simplifier` is unavailable in this environment; a manual simplification review was substituted and recorded honestly (evidence: null)

## Patterns

- [2026-07-11] Monorepo structure: apps/web (Next.js), packages/agents (Jick, Jall, and Superlinked), packages/db, packages/auth, packages/voice, packages/shared
- [2026-07-11] Zod schemas in packages/shared define all data shapes — used in agents, API routes, and frontend
- [2026-07-11] Firebase emulator (`demo-jj` project) used for all integration tests — no live Firebase in CI
- [2026-07-11] Superseded by v1 execution rules: every changed file uses the mandatory code-simplifier Tier 2 gate
- [2026-07-11] Agent 1 owns narrow non-API page/component scopes; Agent 2 owns packages, Firebase, scripts, and `apps/web/app/api` scopes
- [2026-07-11] Claims must land in the owning runtime file on shared main before an implementation branch reserves work

## Gotchas

- [2026-07-11] ElevenLabs integration tests require ELEVENLABS_API_KEY + audio device — skip in CI, manual QA only
- [2026-07-11] Superseded by v1: phone verification is not used; Google sign-in and email/password are the supported methods
- [2026-07-11] Superseded: Hermes uses the official CLI installer and custom provider configuration, not an npm runtime package
- [2026-07-11] Next.js middleware cannot use firebase-admin directly — use session cookies + server-side validation
- [2026-07-11] `docs/superpowers/specs/jick-and-jall.md` is historical; v1 execution uses the dated design, v1 plan, v1 executable spec, and v3 state
- [2026-07-11] Parallel implementation begins after Agent 1 lands T0.1.1; before that stage, the shared toolchain/state validator is intentionally serialized
- [2026-07-11] `~/package.json` pins packageManager yarn and shadowed pnpm until the repo got its own package.json; run pnpm from repo root
- [2026-07-11] Local Node is v26 but `.nvmrc` pins 22; `.ts`/`.mts` scripts run via `tsx`; pnpm ignores esbuild build scripts but tsx/vitest still work
- [2026-07-11] RESOLVED: Hermes CLI installed via official installer to ~/.local/bin/hermes (hermes-agent 0.18.2); repo-local .hermes/config.yaml (gitignored) copied from the example; T0.2.2 tier1 (`hermes version && hermes status`) and tier4 (`hermes:smoke`) now pass
- [2026-07-11] RESOLVED: installed openjdk 26 (brew, keg-only) and firebase-tools 13.29.1 (root devDep); the demo-jj emulator starts and rules tests pass. `java` must be on PATH: `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"` (added to ~/.zshrc). Run emulator work as `pnpm firebase:exec -- "COMMAND"` (quote the command as one arg)
- [2026-07-11] Removed the stray `.worktrees/agent-1-t0.1.1` worktree/branch (a duplicate T0.1.1 attempt) to keep a single main line
- [2026-07-11] Root vitest.config.ts excludes **/tests/rules/**; @jj/test-support has its own vitest.config.ts that includes them so `test:rules` runs under the firebase:exec wrapper
- [2026-07-11] Emit-safe NodeNext packages (e.g. @jj/shared) must use `.js` extensions in relative imports; scripts/ uses `.ts` extensions because scripts/tsconfig.json sets allowImportingTsExtensions+noEmit
- [2026-07-11] Package unit tests import from the built package name (`@jj/shared`) not `../src`, so tier3 must run after tier1 build (protocol already orders them that way)
- [2026-07-11] (was a blocker, now RESOLVED — see above) Java + firebase-tools are installed and the demo-jj emulator runs; T1.2.2 is complete. T1.3.1 remains gated only by its normal dependency on agent-1's T1.1.2 (Next.js foundation), not by tooling.

## Open Questions

- [2026-07-11] Slack / Ashby integrations (from Jack & Jill original) — not in scope for v1, revisit post-T7
- [2026-07-11] Live Stripe activation remains a separate human decision after marketplace terms and operational readiness are approved
