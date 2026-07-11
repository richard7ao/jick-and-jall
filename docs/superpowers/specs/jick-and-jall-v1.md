# Jick & Jall v1 — Executable Project Spec

**Status:** Ready for execution review
**Design:** `docs/superpowers/specs/2026-07-11-jick-and-jall-v1-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-07-11-jick-and-jall-v1.md`
**State schema:** v3.0

## Execution rules

- The hierarchy is Project → Task → Step → Stage.
- `tasks/state.json` is the stable schedule; normal work changes only the owning agent runtime file.
- `ready` and parent status are derived, never stored.
- Every stage uses test-first implementation and an independent atomic commit.
- Before Tier 2 is asserted, dispatch `code-simplifier:code-simplifier` over every changed file and resolve all findings. If that reviewer is unavailable, record a blocker.
- The Tier 2 shell command validates recorded reviewer evidence; it does not replace the reviewer.
- All commands run from the repository root with strict failure propagation.
- `pnpm firebase:exec -- COMMAND` starts the `demo-jj` emulators, runs the supplied command, and guarantees teardown.
- Live provider checks are limited to designated T0/T8 smoke stages and never print provider bodies or credentials.
- Each stage may update its owner's runtime state file in addition to its declared write scopes.

## Human gates

### G2.WAITLIST_APPROVAL

After `T2.3.1`, Agent 1 records the user's decision in `tasks/state-agent-1.json`. The gate blocks `T3.1.1` and `T3.1.2`. Approval requires reviewing the deployed English and Spanish waitlist on desktop and mobile; automated tests cannot approve it.

A separate post-T8 decision controls live Stripe activation. It is not required to complete the hackathon's test-mode v1 and cannot be inferred from test success.


## T0 — Prerequisites, secrets, hackathon evidence, and two-computer control

**Description:** Bootstrap both machines, validate coordination, verify providers, and preserve sanitized Hermes evidence.

### T0.1 — Delivery controls

**Description:** Pin the workspace, validate state, and define bilingual content and asset contracts.

#### T0.1.1 — Pinned toolchain and v3 state validator

**Description:** Pin Node/pnpm, add strict state validation/reporting, and reject dependency, hash, queue, lease, and scope inconsistencies.
**Owner:** `agent-1`
**Weight:** 4
**Writes:** `file:.nvmrc`, `file:package.json`, `file:pnpm-lock.yaml`, `file:pnpm-workspace.yaml`, `file:turbo.json`, `file:tsconfig.base.json`, `file:eslint.config.mjs`, `file:.prettierrc.json`, `tree:scripts/state`

**Verify:**

```bash
# tier1_build
pnpm install --frozen-lockfile && pnpm state:validate
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T0.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm vitest run scripts/state
```

```bash
# tier4_integration
pnpm state:validate && pnpm state:report --check
```


#### T0.1.2 — Bilingual content and reference-asset contract

**Description:** Create English/Spanish parity checks and a rights-aware local asset manifest.
**Owner:** `agent-1`
**Weight:** 3
**Requires:** T0.1.1
**Writes:** `tree:content`, `tree:scripts/content`, `file:docs/references/assets.json`, `file:docs/references/flows/README.md`, `file:jackandJillPics/README.md`

**Verify:**

```bash
# tier1_build
pnpm content:validate
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T0.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm vitest run scripts/content
```

```bash
# tier4_integration
pnpm content:check-assets
```


### T0.2 — Credentials, providers, and Hermes

**Description:** Verify redacted provider connectivity on both machines and preserve hackathon evidence.

#### T0.2.1 — Redacted environment and provider bootstrap

**Description:** Validate required configuration and bounded live connectivity on both computers without printing values or bodies.
**Owner:** `agent-2`
**Weight:** 4
**Requires:** T0.1.1
**Writes:** `file:.env.example`, `file:scripts/tsconfig.json`, `tree:scripts/bootstrap`

**Verify:**

```bash
# tier1_build
pnpm exec tsc -p scripts/tsconfig.json --noEmit
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T0.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm vitest run scripts/bootstrap/check-env.test.ts scripts/bootstrap/redact.test.ts
```

```bash
# tier4_integration
pnpm bootstrap:check --require-live --redact
```


#### T0.2.2 — Hermes custom-provider smoke and sanitized receipt

**Description:** Configure Hermes against Superlinked as a developer coding partner and commit one substantive sanitized receipt.
**Owner:** `agent-2`
**Weight:** 3
**Requires:** T0.2.1
**Writes:** `file:.hermes/config.example.yaml`, `file:.gitignore`, `tree:scripts/bootstrap`, `tree:docs/hackathon/hermes-receipts`

**Verify:**

```bash
# tier1_build
hermes version && hermes status
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T0.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm vitest run scripts/bootstrap/sanitize-hermes-receipt.test.ts
```

```bash
# tier4_integration
pnpm hermes:smoke --no-print-body && pnpm hermes:verify-receipt
```


## T1 — Supported monorepo, contracts, Firebase, and tests

**Description:** Create the supported application foundation and typed data/security boundaries.

### T1.1 — Application workspace

**Description:** Create the monorepo and bilingual Next.js foundation.

#### T1.1.1 — Workspace package scaffold and CI

**Description:** Create every workspace package manifest and CI entry before package implementation diverges.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T0.1.2, T0.2.2
**Writes:** `file:package.json`, `file:pnpm-lock.yaml`, `file:pnpm-workspace.yaml`, `file:turbo.json`, `file:.github/workflows/ci.yml`, `file:apps/web/package.json`, `tree:packages`

**Verify:**

```bash
# tier1_build
pnpm install --frozen-lockfile && pnpm turbo run build --dry=json
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T1.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm vitest run scripts/state/workspace-manifests.test.ts
```

```bash
# tier4_integration
pnpm -r exec node -e "require('./package.json')"
```


#### T1.1.2 — Next.js 16 bilingual web foundation

**Description:** Create locale routing, warm tokens, loading/error states, and a production-building Next.js shell.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T1.1.1
**Writes:** `tree:apps/web`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T1.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/foundation
```

```bash
# tier4_integration
pnpm --filter @jj/web exec playwright test e2e/foundation.spec.ts
```


### T1.2 — Contracts and Firebase foundation

**Description:** Create shared schemas, emulators, rules, fakes, and fixtures.

#### T1.2.1 — Versioned shared schemas and state machines

**Description:** Define strict Zod contracts for every v1 record and pure legal deal transitions.
**Owner:** `agent-2`
**Weight:** 6
**Requires:** T1.1.1
**Writes:** `tree:packages/shared`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/shared build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T1.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/shared test --run
```

```bash
# tier4_integration
node packages/shared/tests/package-import-smoke.mjs
```


#### T1.2.2 — Firebase emulators, default-deny rules, and test support

**Description:** Create emulator configuration, fixtures, fakes, indexes, and explicit allow/deny rules tests.
**Owner:** `agent-2`
**Weight:** 5
**Requires:** T1.2.1
**Writes:** `tree:infra/firebase`, `tree:packages/test-support`

**Verify:**

```bash
# tier1_build
pnpm firebase:validate
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T1.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/test-support test --run
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/test-support test:rules
```


### T1.3 — Typed persistence

**Description:** Create session helpers and the typed Firestore repository layer.

#### T1.3.1 — Authentication helpers and typed repositories

**Description:** Create Firebase factories, CSRF/session primitives, converters, and repository-only persistence.
**Owner:** `agent-2`
**Weight:** 6
**Requires:** T1.1.2, T1.2.2
**Writes:** `tree:packages/auth`, `tree:packages/db`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/auth build && pnpm --filter @jj/db build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T1.3.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/auth test --run && pnpm --filter @jj/db test --run
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/db test:integration
```


## T2 — Bilingual marketing, waitlist, invitations, and launch gate

**Description:** Ship the public launch surface and stop for explicit user approval.

### T2.1 — Public experience

**Description:** Create the warm bilingual marketing surface.

#### T2.1.1 — Warm bilingual marketing experience

**Description:** Build the warm two-sided public story using local rights-documented imagery and no copied Jack & Jill content.
**Owner:** `agent-1`
**Weight:** 7
**Requires:** T1.1.2
**Writes:** `file:apps/web/app/globals.css`, `tree:apps/web/app/[locale]/(marketing)`, `tree:apps/web/components/ui`, `tree:apps/web/components/marketing`, `tree:apps/web/public/marketing`, `tree:apps/web/tests/marketing`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T2.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/marketing
```

```bash
# tier4_integration
pnpm --filter @jj/web exec playwright test e2e/marketing.spec.ts --project=mobile-chrome
```


### T2.2 — Waitlist and invitations

**Description:** Capture low-friction entries and approve them manually.

#### T2.2.1 — Accessible bilingual waitlist experience

**Description:** Create role/email/consent-first capture with optional qualifications and resilient confirmation states.
**Owner:** `agent-1`
**Weight:** 6
**Requires:** T2.1.1, T1.2.1
**Writes:** `tree:apps/web/app/[locale]/(marketing)/waitlist`, `tree:apps/web/components/waitlist`, `tree:apps/web/tests/waitlist`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T2.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/waitlist
```

```bash
# tier4_integration
pnpm --filter @jj/web exec playwright test e2e/waitlist-ui.spec.ts
```


#### T2.2.2 — Waitlist API, invitations, email, and audit

**Description:** Persist idempotent entries, approve/reject through protected scripts, send bilingual invitations, and audit every action.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T1.3.1
**Writes:** `file:packages/db/src/repositories/waitlist.ts`, `file:packages/db/src/repositories/invitations.ts`, `tree:packages/email`, `tree:apps/web/app/api/waitlist`, `tree:apps/web/app/api/admin/invitations`, `tree:scripts/admin/waitlist`, `file:packages/test-support/src/fakes/email.ts`, `tree:apps/web/tests/api/waitlist`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/email build && pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T2.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/api/waitlist
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm test:integration:waitlist
```


### T2.3 — Launch acceptance

**Description:** Verify and deploy the waitlist candidate before human approval.

#### T2.3.1 — Analytics, complete waitlist E2E, and deploy evidence

**Description:** Add privacy-safe launch events, verify both languages end to end, and prepare deploy evidence for the human gate.
**Owner:** `agent-1`
**Weight:** 4
**Requires:** T2.2.1, T2.2.2
**Writes:** `tree:apps/web/components/analytics`, `tree:apps/web/src/analytics`, `file:apps/web/e2e/marketing-waitlist.spec.ts`, `file:apps/web/playwright.config.ts`, `file:docs/testing/t2-waitlist.md`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T2.3.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/analytics
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/marketing-waitlist.spec.ts
```


## T3 — Invitation-gated authentication, shells, and media security

**Description:** Create separate role accounts, secure sessions, app shells, and private media authorization.

### T3.1 — Identity

**Description:** Consume invitations and create immutable role sessions.

#### T3.1.1 — Invitation consumption, immutable roles, and secure sessions

**Description:** Implement Google/password invitation registration, server sessions, CSRF, revocation, and immutable authorization.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T2.2.2
**Gate Requires:** G2.WAITLIST_APPROVAL
**Writes:** `file:packages/auth/src/session.ts`, `file:packages/auth/src/csrf.ts`, `file:packages/auth/src/authorization.ts`, `file:packages/db/src/repositories/users.ts`, `tree:apps/web/app/api/auth`, `tree:apps/web/tests/api/auth`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/auth build && pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T3.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/api/auth
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm test:integration:auth-api
```


#### T3.1.2 — Bilingual sign-in and invitation registration UI

**Description:** Create Google/password sign-in, invited registration, recovery, and enumeration-safe bilingual errors.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T1.2.1
**Gate Requires:** G2.WAITLIST_APPROVAL
**Writes:** `tree:apps/web/app/[locale]/(auth)`, `tree:apps/web/components/auth`, `tree:apps/web/tests/auth`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T3.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/auth
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/auth-ui.spec.ts
```


### T3.2 — Authenticated surface

**Description:** Create separate role shells and owner-scoped media access.

#### T3.2.1 — Creator and brand application shells

**Description:** Create separate mobile-responsive role homes and navigation with no role switcher.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T3.1.1, T3.1.2
**Writes:** `tree:apps/web/app/[locale]/(app)`, `tree:apps/web/components/app-shell`, `tree:apps/web/tests/app-shell`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T3.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/app-shell
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/app-shell.spec.ts
```


#### T3.2.2 — Owner/admin media authorization and full auth E2E

**Description:** Enforce owner/admin-only private media operations and verify the complete invitation/session journey.
**Owner:** `agent-2`
**Weight:** 6
**Requires:** T3.1.1, T3.2.1
**Writes:** `file:infra/firebase/firestore.rules`, `file:infra/firebase/storage.rules`, `file:infra/firebase/tests/auth-media.rules.test.ts`, `file:packages/auth/src/media-authorization.ts`, `tree:apps/web/app/api/media`, `file:apps/web/e2e/invited-auth.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm firebase:validate && pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T3.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm firebase:exec -- pnpm vitest run infra/firebase/tests/auth-media.rules.test.ts
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/invited-auth.spec.ts
```


## T4 — Jick creator onboarding and private media

**Description:** Build bilingual voice/text creator onboarding, editable profiles, recordings, transcripts, deletion, and export.

### T4.1 — Voice and orchestration platform

**Description:** Create typed provider clients and Jick persistence APIs.

#### T4.1.1 — ElevenLabs and Superlinked typed clients

**Description:** Create scoped voice/deletion and normalized Superlinked clients with bounded retries, schema output, and redacted errors.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T3.2.2
**Writes:** `tree:packages/voice`, `tree:packages/agents/src/superlinked`, `tree:packages/agents/tests/superlinked`, `file:packages/test-support/src/fakes/elevenlabs.ts`, `file:packages/test-support/src/fakes/superlinked.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/voice build && pnpm --filter @jj/agents build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T4.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/voice test --run && pnpm --filter @jj/agents test --run tests/superlinked
```

```bash
# tier4_integration
pnpm test:contract:providers
```


#### T4.1.2 — Jick extraction, persistence, consent, deletion, and APIs

**Description:** Create bilingual extraction, draft persistence, consent, session completion, export, direct deletion, and an idempotent daily purge that removes sessions older than 90 days from Firestore, Storage, and ElevenLabs while retaining only non-content tombstones.
**Owner:** `agent-2`
**Weight:** 8
**Requires:** T4.1.1
**Writes:** `tree:packages/agents/src/jick`, `tree:packages/agents/tests/jick`, `file:packages/db/src/repositories/voice-sessions.ts`, `file:packages/db/src/repositories/creator-profiles.ts`, `file:packages/db/src/repositories/audit-events.ts`, `tree:apps/web/app/api/voice`, `tree:apps/web/app/api/creator/profile`, `tree:apps/web/app/api/account/export`, `tree:apps/web/app/api/internal/voice-retention`, `tree:apps/web/tests/api/jick`, `tree:scripts/admin/voice-retention`, `file:vercel.json`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build && pnpm --filter @jj/db build && pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T4.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/agents test --run tests/jick && pnpm --filter @jj/web test --run tests/api/jick
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm test:integration:jick-api
```


### T4.2 — Creator experience

**Description:** Create voice/text onboarding, profile editing, playback, deletion, and export.

#### T4.2.1 — Voice/text interview and editable generated profile

**Description:** Create consent/language choice, live transcript, interruption recovery, equivalent text intake, and editable preview.
**Owner:** `agent-1`
**Weight:** 8
**Requires:** T4.1.2, T3.2.1
**Writes:** `tree:apps/web/app/[locale]/(app)/creator/onboarding`, `tree:apps/web/components/onboarding`, `file:apps/web/hooks/use-voice-session.ts`, `tree:apps/web/tests/onboarding`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T4.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/onboarding
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/creator-onboarding.spec.ts
```


#### T4.2.2 — Published profile, playback, deletion/export, and Jick E2E

**Description:** Create profile publish/edit, authorized playback, session deletion/export, and full bilingual voice/text journeys.
**Owner:** `agent-1`
**Weight:** 7
**Requires:** T4.1.2, T4.2.1
**Writes:** `tree:apps/web/app/[locale]/(app)/creator/profile`, `tree:apps/web/app/[locale]/(app)/creator/settings/privacy`, `tree:apps/web/components/creator-profile`, `tree:apps/web/components/recordings`, `tree:apps/web/tests/creator-profile`, `file:apps/web/e2e/jick-complete.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T4.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/creator-profile
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/jick-complete.spec.ts
```


## T5 — Jall brand profile and campaign onboarding

**Description:** Build bilingual brand onboarding and editable campaign briefs.

### T5.1 — Jall platform

**Description:** Extract and persist brand profiles and campaign briefs.

#### T5.1.1 — Jall extraction and persistence

**Description:** Extract bilingual brand/campaign drafts with validated retry/fallback and owner-scoped persistence.
**Owner:** `agent-2`
**Weight:** 6
**Requires:** T4.1.1, T4.1.2
**Writes:** `tree:packages/agents/src/jall`, `tree:packages/agents/tests/jall`, `file:packages/db/src/repositories/brand-profiles.ts`, `file:packages/db/src/repositories/campaigns.ts`, `file:packages/db/tests/brand-profiles.test.ts`, `file:packages/db/tests/campaigns.test.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build && pnpm --filter @jj/db build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T5.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/agents test --run tests/jall && pnpm --filter @jj/db test --run tests/brand-profiles.test.ts tests/campaigns.test.ts
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/agents test:integration -- jall-persistence
```


#### T5.1.2 — Authenticated Jall APIs

**Description:** Expose authorized voice/text extraction, draft update, and publish operations.
**Owner:** `agent-2`
**Weight:** 4
**Requires:** T3.1.1, T5.1.1
**Writes:** `tree:apps/web/app/api/jall`, `tree:apps/web/tests/api/jall`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web typecheck && pnpm --filter @jj/web lint
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T5.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/api/jall
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web test:integration -- jall-api
```


### T5.2 — Brand experience

**Description:** Create mobile bilingual intake and review/publish screens.

#### T5.2.1 — Bilingual voice/text campaign intake

**Description:** Create mobile bilingual voice/text intake with equivalent questions and recovery.
**Owner:** `agent-1`
**Weight:** 6
**Requires:** T4.2.2, T5.1.2
**Writes:** `tree:apps/web/app/[locale]/(app)/brand/onboarding`, `tree:apps/web/components/jall`, `tree:apps/web/tests/components/jall`, `file:apps/web/e2e/jall-onboarding.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T5.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/jall
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/jall-onboarding.spec.ts --project=chromium
```


#### T5.2.2 — Brand profile and brief review/publish

**Description:** Create editable brand/campaign review, validation, and explicit publish.
**Owner:** `agent-1`
**Weight:** 4
**Requires:** T5.2.1
**Writes:** `tree:apps/web/app/[locale]/(app)/brand/profile`, `tree:apps/web/app/[locale]/(app)/brand/campaigns`, `tree:apps/web/components/brand-editors`, `tree:apps/web/tests/components/brand-editors`, `file:apps/web/e2e/brand-edit-publish.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T5.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/brand-editors
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/brand-edit-publish.spec.ts --project=chromium
```


## T6 — Superlinked matching, consent, inbox, and chat

**Description:** Rank registered creators deterministically, gate disclosure by consent, and open authorized conversations.

### T6.1 — Matching and disclosure

**Description:** Combine semantic signals with deterministic ranking and consent.

#### T6.1.1 — Superlinked signals and deterministic ranker

**Description:** Combine frozen semantic signals with hard filters, explicit weights, and stable tie-breaking.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T4.1.2, T5.1.1
**Writes:** `tree:packages/agents/src/matching`, `tree:packages/agents/tests/matching`, `tree:packages/test-support/src/fixtures/matching`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build && pnpm --filter @jj/test-support build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T6.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/agents test --run tests/matching
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/agents test:integration -- matching-frozen-vectors
```


#### T6.1.2 — Match, feedback, consent, and disclosure APIs

**Description:** Persist matches and feedback, reveal anonymized previews, and open disclosure only after creator consent.
**Owner:** `agent-2`
**Weight:** 6
**Requires:** T5.1.2, T6.1.1
**Writes:** `file:packages/db/src/repositories/matches.ts`, `file:packages/db/tests/matches.test.ts`, `tree:apps/web/app/api/matches`, `tree:apps/web/tests/api/matches`, `tree:scripts/admin/matches`, `file:infra/firebase/firestore.rules`, `file:infra/firebase/tests/matches.rules.test.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/db build && pnpm --filter @jj/web typecheck && pnpm firebase:validate
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T6.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/db test --run tests/matches.test.ts && pnpm --filter @jj/web test --run tests/api/matches
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web test:integration -- match-consent-disclosure
```


#### T6.1.3 — Match and consent UI

**Description:** Create fit-reason previews, creator decisions, and post-consent disclosure without catalog or score UI.
**Owner:** `agent-1`
**Weight:** 7
**Requires:** T4.2.2, T5.2.2, T6.1.2
**Writes:** `tree:apps/web/app/[locale]/(app)/brand/matches`, `tree:apps/web/app/[locale]/(app)/creator/opportunities`, `tree:apps/web/components/matches`, `tree:apps/web/tests/components/matches`, `file:apps/web/e2e/match-consent.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T6.1.3 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/matches
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/match-consent.spec.ts --project=chromium
```


### T6.2 — Conversations

**Description:** Create authorized inbox and real-time chat.

#### T6.2.1 — Authorized inbox/chat repository and APIs

**Description:** Create accepted-counterparty-only threads, rate-limited idempotent sends, and rules.
**Owner:** `agent-2`
**Weight:** 6
**Requires:** T6.1.2
**Writes:** `file:packages/db/src/repositories/conversations.ts`, `file:packages/db/tests/conversations.test.ts`, `tree:apps/web/app/api/conversations`, `tree:apps/web/tests/api/conversations`, `file:infra/firebase/firestore.rules`, `file:infra/firebase/tests/conversations.rules.test.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/db build && pnpm --filter @jj/web typecheck
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T6.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/db test --run tests/conversations.test.ts && pnpm --filter @jj/web test --run tests/api/conversations
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web test:integration -- conversations-auth-rate-limit
```


#### T6.2.2 — Bilingual inbox and real-time chat UI

**Description:** Create role-aware inbox, real-time text chat, links, delivery states, and bilingual empty/errors.
**Owner:** `agent-1`
**Weight:** 6
**Requires:** T6.1.3, T6.2.1
**Writes:** `tree:apps/web/app/[locale]/(app)/inbox`, `tree:apps/web/app/[locale]/(app)/conversations`, `tree:apps/web/components/chat`, `tree:apps/web/tests/components/chat`, `file:apps/web/e2e/introduction-chat.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T6.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/chat
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/introduction-chat.spec.ts --project=chromium
```


## T7 — Offers, delivery, Stripe, and intervention

**Description:** Complete a versioned offer, test-mode payment, delivery, approval, payout, and manual exception path.

### T7.1 — Offers and deal state

**Description:** Version terms and record mutual acceptance in an append-only state machine.

#### T7.1.1 — Versioned offers and deal event machine

**Description:** Create Stripe Connect onboarding/readiness, immutable offer versions, separate acceptances, and authorized append-only deal events; creator acceptance of a first paid offer fails until payouts are enabled.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T6.2.1
**Writes:** `file:packages/shared/src/deal-state.ts`, `file:packages/shared/tests/deal-state-machine.test.ts`, `file:packages/db/src/repositories/deals.ts`, `file:packages/db/src/repositories/deliveries.ts`, `file:packages/db/tests/deals.test.ts`, `file:packages/payments/src/connect.ts`, `file:packages/payments/tests/connect.test.ts`, `tree:apps/web/app/api/stripe/connect`, `tree:apps/web/tests/api/stripe/connect`, `tree:apps/web/app/api/offers`, `tree:apps/web/app/api/deals`, `tree:apps/web/tests/api/offers`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/shared build && pnpm --filter @jj/db build && pnpm --filter @jj/payments build && pnpm --filter @jj/web typecheck
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T7.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/shared test --run tests/deal-state-machine.test.ts && pnpm --filter @jj/payments test --run tests/connect.test.ts && pnpm --filter @jj/web test --run tests/api/offers tests/api/stripe/connect
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web test:integration -- versioned-offer-mutual-acceptance
```


#### T7.1.2 — Offer composer and acceptance UI

**Description:** Guide creators through Stripe-hosted Connect onboarding before first paid acceptance, compose terms in chat, show both acceptances, and clear them visibly after edits.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T6.2.2, T7.1.1
**Writes:** `tree:apps/web/app/[locale]/(app)/settings/payouts`, `tree:apps/web/components/payments`, `tree:apps/web/tests/components/payments`, `tree:apps/web/components/offers`, `tree:apps/web/tests/components/offers`, `file:apps/web/e2e/offer-versioning.spec.ts`, `file:apps/web/components/chat/conversation.tsx`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T7.1.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/offers tests/components/payments
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/offer-versioning.spec.ts --project=chromium
```


### T7.2 — Stripe funding and payout ledger

**Description:** Create Checkout, webhooks, and reconciliation after Connect readiness is already enforced by T7.1.

#### T7.2.1 — Checkout, idempotent webhooks, and ledger

**Description:** Extend the existing Stripe package with the brand charge plus 10% fee, webhook authority, idempotency, and integer ledger reconciliation.
**Owner:** `agent-2`
**Weight:** 8
**Requires:** T0.2.1, T7.1.1
**Writes:** `tree:packages/payments`, `file:packages/db/src/repositories/transactions.ts`, `file:packages/db/tests/transactions.test.ts`, `tree:apps/web/app/api/stripe`, `tree:apps/web/tests/api/stripe`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/payments build && pnpm --filter @jj/db build && pnpm --filter @jj/web typecheck
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T7.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/payments test --run && pnpm --filter @jj/web test --run tests/api/stripe
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/payments test:integration -- checkout-webhook-replay-ledger
```


#### T7.2.2 — Funding and payment status UI

**Description:** Create brand Checkout launch and webhook-derived status UI, consuming the Connect readiness UI established in T7.1.2.
**Owner:** `agent-1`
**Weight:** 6
**Requires:** T7.1.2, T7.2.1
**Writes:** `tree:apps/web/app/[locale]/(app)/deals/[dealId]/fund`, `tree:apps/web/components/payments`, `tree:apps/web/tests/components/payments`, `file:apps/web/e2e/connect-funding-status.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T7.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/payments
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/connect-funding-status.spec.ts --project=chromium
```


### T7.3 — Delivery and controlled intervention

**Description:** Handle delivery, revision, dispute, payout, refund, and reversal operations.

#### T7.3.1 — Delivery, revision, dispute, and protected interventions

**Description:** Handle external URLs, one revision, disputes, test timed release, and authenticated audited manual actions while hard-disabling live auto-release.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T7.2.1, T7.1.1
**Writes:** `tree:apps/web/app/api/deliveries`, `tree:apps/web/app/api/admin/deals`, `tree:apps/web/app/api/internal/payouts/release-due`, `tree:apps/web/tests/api/deliveries`, `tree:apps/web/tests/api/admin`, `tree:scripts/admin/deals`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web typecheck && pnpm --filter @jj/web lint
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T7.3.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/api/deliveries tests/api/admin
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web test:integration -- delivery-revision-dispute-manual-resolution
```


#### T7.3.2 — Delivery/dispute UI and complete test deal

**Description:** Create delivery, revision, approval, dispute, and payout status UI and verify one full two-account test deal.
**Owner:** `agent-1`
**Weight:** 6
**Requires:** T7.2.2, T7.3.1
**Writes:** `tree:apps/web/app/[locale]/(app)/deals/[dealId]`, `tree:apps/web/components/deliveries`, `tree:apps/web/tests/components/deliveries`, `file:apps/web/e2e/complete-test-deal.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T7.3.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
pnpm --filter @jj/web test --run tests/components/deliveries
```

```bash
# tier4_integration
pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/complete-test-deal.spec.ts --project=chromium
```


## T8 — Development, staging, and production-safe testing guide

**Description:** Make every major capability reproducibly testable without unsafe production mutations.

### T8.1 — Guide contract

**Description:** Define and validate the required structure for every manual test.

#### T8.1.1 — Manual-case schema and validator

**Description:** Require prerequisites, environment, identities, actions, expected results, evidence, diagnosis, cleanup, and rollback while rejecting unsafe production actions.
**Owner:** `agent-2`
**Weight:** 4
**Requires:** T7.3.2
**Writes:** `file:docs/testing/manual/CASE-FORMAT.md`, `tree:scripts/verify`

**Verify:**

```bash
# tier1_build
node --check scripts/verify/manual-guide.mjs
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T8.1.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
node --test scripts/verify/manual-guide.test.mjs
```

```bash
# tier4_integration
node scripts/verify/manual-guide.mjs scripts/verify/fixtures/manual-guide/valid
```


### T8.2 — Capability guides

**Description:** Document and exercise product, service, payment, and security journeys.

#### T8.2.1 — Bilingual product journey guide

**Description:** Document and automate both languages across waitlist, auth, voice/text, privacy, matching, chat, offers, and delivery.
**Owner:** `agent-1`
**Weight:** 7
**Requires:** T8.1.1
**Writes:** `file:docs/testing/manual/10-marketing-waitlist-auth.md`, `file:docs/testing/manual/20-onboarding-media-profiles.md`, `file:docs/testing/manual/30-matching-chat-deals.md`, `file:apps/web/e2e/t8-product-journeys.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm exec markdownlint-cli2 "docs/testing/manual/{10,20,30}-*.md"
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T8.2.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
node scripts/verify/manual-guide.mjs docs/testing/manual/10-marketing-waitlist-auth.md docs/testing/manual/20-onboarding-media-profiles.md docs/testing/manual/30-matching-chat-deals.md
```

```bash
# tier4_integration
pnpm firebase:exec -- env JJ_TEST_ENV=development pnpm --filter @jj/web exec playwright test e2e/t8-product-journeys.spec.ts --project=chromium
```


#### T8.2.2 — Services, payments, security, and staging guide

**Description:** Document provider recovery, rules, rate limits, administration, Stripe test actions, reconciliation, cleanup, and rollback.
**Owner:** `agent-2`
**Weight:** 7
**Requires:** T8.1.1, T7.3.1
**Writes:** `file:docs/testing/manual/40-services-security.md`, `file:docs/testing/manual/50-payments-admin.md`, `file:docs/testing/manual/60-staging.md`, `file:packages/test-support/tests/t8-platform-runbook.integration.test.ts`

**Verify:**

```bash
# tier1_build
pnpm exec markdownlint-cli2 "docs/testing/manual/{40,50,60}-*.md" && pnpm --filter @jj/test-support build
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T8.2.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
node scripts/verify/manual-guide.mjs docs/testing/manual/40-services-security.md docs/testing/manual/50-payments-admin.md docs/testing/manual/60-staging.md
```

```bash
# tier4_integration
env JJ_TEST_ENV=staging pnpm --filter @jj/test-support test --run tests/t8-platform-runbook.integration.test.ts
```


### T8.3 — Devices and environment safety

**Description:** Cover browser/accessibility recovery and safe production operations.

#### T8.3.1 — Browser, mobile, accessibility, and recovery guide

**Description:** Cover desktop/mobile engines, keyboard, WCAG AA, reduced motion, responsive layout, and provider failure recovery.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T8.2.1
**Writes:** `file:docs/testing/manual/70-browser-accessibility-recovery.md`, `file:apps/web/e2e/t8-browser-accessibility.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm exec markdownlint-cli2 docs/testing/manual/70-browser-accessibility-recovery.md && pnpm --filter @jj/web typecheck
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T8.3.1 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
node scripts/verify/manual-guide.mjs docs/testing/manual/70-browser-accessibility-recovery.md
```

```bash
# tier4_integration
env JJ_TEST_ENV=development pnpm --filter @jj/web exec playwright test e2e/t8-browser-accessibility.spec.ts --project=chromium --project=firefox --project=webkit
```


#### T8.3.2 — Unified environments, evidence, cleanup, and rollback runbook

**Description:** Unify emulator, staging, and read-only/denial-only production tests with evidence, cleanup, and rollback.
**Owner:** `agent-1`
**Weight:** 5
**Requires:** T8.2.2, T8.3.1
**Writes:** `file:docs/testing/manual/README.md`, `file:docs/testing/manual/00-environments.md`, `file:docs/testing/manual/EVIDENCE.md`, `file:docs/testing/manual/ROLLBACK.md`, `file:apps/web/e2e/t8-production-safe.spec.ts`

**Verify:**

```bash
# tier1_build
pnpm exec markdownlint-cli2 "docs/testing/manual/**/*.md" && pnpm --filter @jj/web typecheck
```

```bash
# tier2_simplify
pnpm state:assert-review --stage T8.3.2 --reviewer code-simplifier:code-simplifier
```

```bash
# tier3_unit
node scripts/verify/manual-guide.mjs docs/testing/manual
```

```bash
# tier4_integration
env JJ_TEST_ENV=production pnpm --filter @jj/web exec playwright test e2e/t8-production-safe.spec.ts --project=chromium
```

## Schedule acceptance

- Active stages: 41
- Agent 1 weight: 116
- Agent 2 weight: 121
- Weight difference: 5 of 118.5 average (4.2%)
- The dependency graph, queue mirrors, gate references, write scopes, and source hashes must pass the v3 validator before any claim.
