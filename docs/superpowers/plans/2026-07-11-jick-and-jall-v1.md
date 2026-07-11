# Jick & Jall v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a bilingual creator marketplace that completes one consent-gated, Stripe test-mode transaction from campaign brief through creator payout.

**Architecture:** A Next.js 16 App Router application owns the web UI and authenticated route handlers. Typed TypeScript packages isolate Firebase, ElevenLabs, Superlinked, Stripe, Resend, state machines, and deterministic matching; three v3 state files coordinate two computers without a shared mutable progress file.

**Tech Stack:** Node.js 22, pinned pnpm 10, TypeScript, Next.js 16, React 19, Tailwind CSS 4, Firebase Auth/Firestore/Storage, ElevenLabs Agents, Superlinked SIE, Stripe Connect/Checkout, Resend, Zod, Vitest, Testing Library, and Playwright.

## Global Constraints

- The approved source of product truth is `docs/superpowers/specs/2026-07-11-jick-and-jall-v1-design.md`.
- The executable stage catalog and its four-tier commands are in `docs/superpowers/specs/jick-and-jall-v1.md`.
- Use TypeScript orchestration first. Hermes is a developer coding partner and backup, never a deployed application dependency.
- Superlinked supplies generation, extraction, embeddings, and ranking signals. Deterministic TypeScript owns routing, retries, authorization, filtering, weights, money, and state transitions.
- Use Firebase Authentication, Firestore, and private Cloud Storage. Do not add Supabase, Mubit, or Firebase Cloud Functions.
- Creator and brand identities use separate accounts and immutable roles. Google sign-in is primary; email/password is the fallback.
- English and Spanish are required across UI, validation, email, voice, and tests.
- Only registered, published, available creators are eligible for matching. A creator must consent before profile disclosure or chat.
- The brand pays the creator amount plus a 10% service fee. Stripe processing is absorbed from that fee. Currency is GBP and the creator amount is £50–£10,000.
- A deal has one deliverable, one payment, one included revision, and one payout. Live automatic payout release remains disabled.
- Recordings default to 90-day retention; transcripts last until account deletion. Raw media is owner/admin-only and deletion propagates to ElevenLabs.
- T2 ends at a human approval gate. No T3 stage may start until the deployed bilingual waitlist is explicitly approved.
- Tier 2 simplification is mandatory for every stage. If `code-simplifier:code-simplifier` is unavailable, the stage is blocked rather than silently skipped.
- No secret, raw provider response, transcript, recording URL, signed URL, email address, or machine-local absolute path may enter Git or task state.
- Do not add external creator discovery, scraping, cold outreach, native mobile apps, additional languages, chat attachments, hosted deliverables, milestones, split payments, partial delivery, multiple payouts, automated dispute decisions, a waitlist dashboard, or real-money hackathon transactions.
- Store shortlist/pass/accept/decline feedback for audit and later analysis; v1 never retrains or mutates ranking weights automatically.

## Source and File Responsibility Map

| Path | Responsibility | Primary owner |
| --- | --- | --- |
| `apps/web/app/[locale]/**` excluding `api` | Marketing, authentication, and product pages | Agent 1 |
| `apps/web/components/**`, `apps/web/hooks/**` | Reusable product UI | Agent 1 |
| `apps/web/app/api/**` | Authenticated server boundaries and webhooks | Agent 2 |
| `packages/shared/**` | Zod contracts, constants, and pure state machines | Agent 2 |
| `packages/auth/**`, `packages/db/**` | Sessions, authorization, and Firestore repositories | Agent 2 |
| `packages/voice/**`, `packages/agents/**` | ElevenLabs, Superlinked, Jick, Jall, and matching | Agent 2 |
| `packages/payments/**`, `packages/email/**` | Stripe and Resend adapters | Agent 2 |
| `packages/test-support/**`, `infra/firebase/**` | Fakes, fixtures, emulators, indexes, and rules | Agent 2 |
| `content/**`, `apps/web/public/**` | Bilingual copy and rights-documented local assets | Agent 1 |
| `docs/testing/manual/**` | T8 manual test system | Split by the catalog's exact stage scopes |
| `tasks/state.json` | Stable schedule; coordination commits only | Coordinator |
| `tasks/state-agent-1.json` | Agent 1 claims, checkpoints, and evidence | Agent 1 |
| `tasks/state-agent-2.json` | Agent 2 claims, checkpoints, and evidence | Agent 2 |

Root manifests, `pnpm-lock.yaml`, shared schemas, Firebase rules, and generated metadata are serialized coordination surfaces. A stage may touch them only when its catalog entry lists the exact file or containing tree.

## Cross-Package Interfaces

These signatures are stable boundaries. Implementations may add private helpers but must not rename or widen these contracts without a coordination stage.

```ts
export type Locale = 'en' | 'es'
export type Role = 'creator' | 'brand'
export type Money = Readonly<{ currency: 'gbp'; amountMinor: number }>
export type DealStatus =
  | 'draft' | 'offered' | 'accepted_by_one_party' | 'mutually_accepted'
  | 'funded' | 'delivered' | 'revision_requested' | 'approved'
  | 'payout_pending' | 'paid' | 'complete' | 'cancelled' | 'disputed'

export interface TranscriptTurn {
  speaker: 'user' | 'agent'
  text: string
  locale: Locale
  startedAtMs: number
}

export interface CreatorProfileDraft {
  bio: string
  platforms: readonly string[]
  niches: readonly string[]
  contentFormats: readonly string[]
  location: string | null
  rateMinMinor: number | null
  rateMaxMinor: number | null
}

export interface CreatorProfile extends CreatorProfileDraft {
  id: string
  ownerUid: string
  published: boolean
  available: boolean
}

export interface BrandProfileDraft {
  name: string
  description: string
  website: string | null
}

export interface CampaignDraft {
  title: string
  goal: string
  platforms: readonly string[]
  contentFormats: readonly string[]
  creatorAmountMinor: number
  deadline: string
}

export interface Campaign extends CampaignDraft {
  id: string
  ownerUid: string
  published: boolean
}

export interface RankedCreator {
  creatorId: string
  score: number
  fitReasons: readonly string[]
}

export interface Deal {
  id: string
  creatorUid: string
  brandUid: string
  status: DealStatus
  activeOfferVersion: number
}

export interface DealEvent {
  idempotencyKey: string
  type: string
  occurredAt: string
  payload: Readonly<Record<string, unknown>>
}

export interface RequestContext {
  uid: string
  role: Role
  locale: Locale
  requestId: string
}

export interface ProviderResult<T> {
  value: T
  providerRequestId: string | null
}
```

```ts
export interface Repository<T extends { id: string }> {
  getAuthorized(id: string, context: RequestContext): Promise<T | null>
  create(input: Omit<T, 'id'>, context: RequestContext): Promise<T>
  update(id: string, patch: Partial<T>, context: RequestContext): Promise<T>
}
```

## Mandatory Per-Stage TDD Micro-Loop

Repeat this short loop for each behavior named by the claimed stage. The stage
catalog supplies the exact target files and full-tier commands.

- [ ] Open the claimed stage, its direct dependencies, and the immediate callers of every file it changes.
- [ ] Add one focused failing assertion to the stage's declared test file.
- [ ] Run that test file and confirm the failure names the missing behavior rather than a setup error.
- [ ] Add the smallest implementation needed for that assertion.
- [ ] Rerun the same test and confirm it passes without skips.
- [ ] Repeat the red/green loop for the next named behavior until the stage contract is covered.
- [ ] Run Tier 1, the independent Tier 2 simplifier, Tier 3, and Tier 4 in order.
- [ ] Record hashes and redacted summaries in the owning runtime file, then commit only the stage scopes and that runtime file.

## Task 0: Prerequisites, Credentials, Hermes, and Two-Computer Control

**Stages:** `T0.1.1`, `T0.1.2`, `T0.2.1`, `T0.2.2`

**Files:**
- Create: `.nvmrc`, `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`
- Create: `scripts/state/validate.ts`, `scripts/state/report.ts`, `scripts/state/scopes.ts`, and colocated tests
- Create: `.env.example`, `scripts/bootstrap/check-env.mts`, `scripts/bootstrap/check-providers.mts`, `scripts/bootstrap/redact.ts`
- Create: `content/en.json`, `content/es.json`, `content/schema.json`, `docs/references/assets.json`
- Create: `.hermes/config.example.yaml`, receipt sanitizer/verifier scripts, and `docs/hackathon/hermes-receipts/T0.2.2.md`

**Interfaces:**

```ts
export type WriteScope = Readonly<
  | { kind: 'file'; path: string }
  | { kind: 'tree'; path: string }
>

export interface SimplificationEvidence {
  reviewer: 'code-simplifier:code-simplifier'
  baseCommit: string
  changedFilesSha256: string
  reviewerPromptSha256: string
  reviewedAt: string
  findingsCount: number
  result: 'passed'
}

export function scopesIntersect(left: WriteScope, right: WriteScope): boolean
export function validateAllState(repoRoot: string): readonly string[]
export function deriveReadyStages(repoRoot: string): readonly string[]
export function assertSimplificationEvidence(stageId: string): void
export function redactSensitive(value: unknown): unknown
```

- [ ] **Step 1: Write failing state and redaction tests.** Cover equal files, file-inside-tree, ancestor trees, safe siblings, dependency cycles, queue drift, stale hashes, forbidden absolute paths, credential-shaped strings, and raw provider bodies.
- [ ] **Step 2: Run the tests and verify the expected failure.** Run `pnpm vitest run scripts/state scripts/bootstrap`; expect missing-module failures for `scopes.ts` and `redact.ts`.
- [ ] **Step 3: Implement the minimum validator and bootstrap boundary.** Reject unknown state keys, normalize repo-relative paths, derive readiness without mutating files, bind Tier 2 evidence to the claim base plus a sorted path/content hash manifest, print only redacted summaries, and use bounded provider probes.
- [ ] **Step 4: Add bilingual content parity and asset-rights validation.** Every English key must have a Spanish key; every production asset entry must include a local path, source URL, author, license, and intended use.
- [ ] **Step 5: Configure Hermes as a custom OpenAI-compatible client for Superlinked.** Keep the real configuration ignored, run a substantive review task, sanitize the receipt, and verify that the committed receipt contains no secret or personal path.
- [ ] **Step 6: Run all four verification tiers for each T0 stage.** Use the exact commands under the matching stage in the executable catalog and record hashes plus redacted summaries in the owning runtime state.
- [ ] **Step 7: Commit each completed stage independently.** Use `chore: complete T0.1.1 — delivery controls`, `feat: complete T0.1.2 — bilingual content contract`, `chore: complete T0.2.1 — provider bootstrap`, and `docs: complete T0.2.2 — Hermes evidence`.

## Task 1: Monorepo, Shared Contracts, Firebase, and Test Foundation

**Stages:** `T1.1.1`, `T1.1.2`, `T1.2.1`, `T1.2.2`, `T1.3.1`

**Files:**
- Create: `apps/web/**` foundation plus manifests for every package in the file map
- Create: `packages/shared/src/schemas/*.ts`, `packages/shared/src/deal-state.ts`, and tests
- Create: `infra/firebase/firebase.json`, rules, indexes, emulator configuration, and rules tests
- Create: `packages/test-support/**`, `packages/auth/**`, and base `packages/db/**`

**Interfaces:**

```ts
import { z } from 'zod'

export const LocaleSchema = z.enum(['en', 'es'])
export const RoleSchema = z.enum(['creator', 'brand'])
export const DealStatusSchema = z.enum([
  'draft', 'offered', 'accepted_by_one_party', 'mutually_accepted',
  'funded', 'delivered', 'revision_requested', 'approved',
  'payout_pending', 'paid', 'complete', 'cancelled', 'disputed',
])

export function canTransitionDeal(
  from: z.infer<typeof DealStatusSchema>,
  to: z.infer<typeof DealStatusSchema>,
): boolean
```

- [ ] **Step 1: Write package-import and schema contract tests.** Assert strict parsing, version fields, integer minor units, immutable identity roles, bilingual locales, and every legal/illegal deal transition.
- [ ] **Step 2: Run shared tests and confirm they fail before schemas exist.** Run `pnpm --filter @jj/shared test --run`; expect unresolved schema exports.
- [ ] **Step 3: Build the smallest versioned Zod contracts and barrel exports.** Stored records carry `schemaVersion`, owner UID, locale where relevant, and timestamps; financial shapes never accept card or bank fields.
- [ ] **Step 4: Write default-deny Firebase rule tests before rules.** Test owner, counterparty, allowlisted administrator, unauthenticated, wrong-role, and unrelated-user cases for every protected collection and media path.
- [ ] **Step 5: Implement emulator config, repository converters, sessions, CSRF primitives, and provider fakes.** Route handlers consume repositories and never call Firestore directly.
- [ ] **Step 6: Build the Next.js bilingual foundation and warm design tokens.** Use `Epilogue`, `Manrope`, the committed OKLCH tokens, reduced-motion behavior, locale routing, and accessible error/loading states.
- [ ] **Step 7: Run each T1 stage's catalog verification and commit.** Use the exact stage ID and title, such as `chore: complete T1.1.1 — workspace package scaffold and CI`; do not combine Agent 1 and Agent 2 stages.

## Task 2: Marketing, Waitlist, Invitations, Email, and Launch Gate

**Stages:** `T2.1.1`, `T2.2.1`, `T2.2.2`, `T2.3.1`

**Files:**
- Create: marketing routes/components, local licensed imagery, and responsive tests
- Create: waitlist UI, API, repositories, Resend adapter/templates, administrator scripts, analytics, and complete Playwright flow

**Interfaces:**

```ts
export interface WaitlistSubmission {
  role: Role
  email: string
  locale: Locale
  consent: Readonly<{ accepted: true; policyVersion: '2026-07-11' }>
  qualification?: Readonly<Record<string, string | number | readonly string[]>>
}

export function submitWaitlist(
  input: WaitlistSubmission,
  idempotencyKey: string,
): Promise<{ entryId: string; created: boolean }>

export function approveWaitlistEntry(
  entryId: string,
  administratorUid: string,
): Promise<{ invitationId: string; expiresAt: string }>
```

- [ ] **Step 1: Write failing service tests.** Cover minimum role/email/consent input, optional qualifications, duplicate idempotency, normalized email, enumeration-safe responses, seven-day invitation expiry, bilingual email, audit events, and retryable email failure.
- [ ] **Step 2: Implement the repository/API/email path.** Store no Firebase user at waitlist time; keep approval behind authenticated allowlisted scripts; persist failed delivery as a retryable notification.
- [ ] **Step 3: Write failing component and browser tests.** Test keyboard flow, screen-reader labels, mobile layout, English/Spanish parity, consent denial, offline retry, analytics minimization, and the exact confirmation states.
- [ ] **Step 4: Implement the warm marketing and waitlist experience.** Use the reference screenshots only for structure; do not copy Jack & Jill branding, claims, testimonials, data, pricing, or recruitment language.
- [ ] **Step 5: Run T2 verification and deploy the waitlist candidate.** Record the deployment URL outside task state if it contains a secret token; task state stores only a safe origin and evidence hash.
- [ ] **Step 6: Stop at `G2.WAITLIST_APPROVAL`.** The designated recorder changes the gate decision only after the user reviews desktop/mobile English/Spanish journeys. Tests cannot auto-approve the gate.

## Task 3: Invitation-Gated Authentication, App Shells, and Media Security

**Stages:** `T3.1.1`, `T3.1.2`, `T3.2.1`, `T3.2.2`

**Files:**
- Create: session exchange/revocation, CSRF, invitation consumption, immutable role authorization, auth pages, role shells, private-media route, and Firebase rule tests

**Interfaces:**

```ts
export interface InvitationClaim {
  invitationId: string
  email: string
  role: Role
}

export function consumeInvitation(
  claim: InvitationClaim,
  firebaseUid: string,
): Promise<{ uid: string; role: Role }>

export function createSession(
  idToken: string,
  csrfToken: string,
): Promise<{ cookie: string; expiresAt: string }>
```

- [ ] **Step 1: Write failing auth/API/rules tests.** Cover Google and password flows, invited-email equality, single use, expiry, immutable roles, uninvited Google users, session revocation, CSRF denial, enumeration protection, and cross-role/cross-owner denial.
- [ ] **Step 2: Implement session and invitation boundaries.** Exchange Firebase ID tokens only on the server; use secure, HTTP-only, same-site cookies; never trust client role or redirect parameters.
- [ ] **Step 3: Build bilingual auth pages and distinct app shells.** There is no role switcher; a person wanting both roles creates two accounts with different emails.
- [ ] **Step 4: Implement owner/admin media authorization.** Return indistinguishable not-found/denied responses and never reveal raw Storage paths or permanent URLs.
- [ ] **Step 5: Run T3 verification and commit each stage independently.** T3 claims are invalid unless `G2.WAITLIST_APPROVAL` is approved on shared `main`.

## Task 4: Jick Creator Voice/Text Onboarding and Private Media

**Stages:** `T4.1.1`, `T4.1.2`, `T4.2.1`, `T4.2.2`

**Files:**
- Create: typed ElevenLabs and Superlinked clients, Jick extraction, voice/profile repositories and APIs, creator onboarding, profile editor, playback, deletion, export, and the idempotent daily retention purge

**Interfaces:**

```ts
export interface VoiceSessionService {
  begin(input: { uid: string; locale: Locale; consentVersion: string }): Promise<{ sessionId: string; signedToken: string }>
  complete(sessionId: string): Promise<{ transcriptTurns: readonly TranscriptTurn[]; recordingStored: boolean }>
  delete(sessionId: string, uid: string): Promise<void>
  purgeExpired(now: string): Promise<{ deleted: number; retryableFailures: number }>
}

export function extractCreatorProfile(
  turns: readonly TranscriptTurn[],
  locale: Locale,
): Promise<ProviderResult<CreatorProfileDraft>>
```

- [ ] **Step 1: Write provider-contract tests with deterministic fakes.** Verify `/v1` normalization, host-bound bearer auth, bounded `Retry-After`, JSON schema validation, redacted errors, ElevenLabs token scope, and upstream deletion.
- [ ] **Step 2: Write failing Jick orchestration and repository tests.** Cover English/Spanish, partial transcript recovery, invalid extraction retry, editable draft, explicit publish, consent metadata, export, non-content deletion tombstones, and an idempotent purge that deletes every session older than 90 days from Firestore, Storage, and ElevenLabs while preserving newer sessions.
- [ ] **Step 3: Implement clients, orchestration, repositories, authenticated APIs, and the protected daily retention route.** A voice failure preserves transcript progress and offers the equivalent text path; retryable purge failures remain durable without extending successful sessions.
- [ ] **Step 4: Write and implement creator UI tests.** Cover consent denial, language change before start, interruption, text fallback, field editing, publish, owner playback, deletion, and unauthorized access.
- [ ] **Step 5: Run complete bilingual Jick E2E verification and commit each stage.** Live provider smoke belongs only to the designated contract check; ordinary tests use fakes.

## Task 5: Jall Brand Profile and Campaign Brief Onboarding

**Stages:** `T5.1.1`, `T5.1.2`, `T5.2.1`, `T5.2.2`

**Files:**
- Create: `packages/agents/src/jall/**`, brand/campaign repositories, authenticated APIs, bilingual voice/text intake, and editable profile/brief pages

**Interfaces:**

```ts
export function extractBrandAndCampaign(
  turns: readonly TranscriptTurn[],
  locale: Locale,
): Promise<ProviderResult<{ brand: BrandProfileDraft; campaign: CampaignDraft }>>

export function publishCampaign(
  campaignId: string,
  context: RequestContext,
): Promise<Campaign>
```

- [ ] **Step 1: Write failing extraction/persistence/API tests.** Cover bilingual output, schema retry/fallback, brand ownership, £50–£10,000 range, required creator criteria, editable drafts, publish validation, and audit metadata.
- [ ] **Step 2: Implement Jall by reusing the T4 provider and voice contracts.** Do not duplicate the Superlinked or ElevenLabs clients.
- [ ] **Step 3: Write and implement mobile-first voice/text intake and review screens.** The text path asks the same questions and produces the same schema as voice.
- [ ] **Step 4: Run T5 catalog verification and commit each stage.** Published campaigns become matchable; drafts do not.

## Task 6: Matching, Consent, Inbox, and Chat

**Stages:** `T6.1.1`, `T6.1.2`, `T6.1.3`, `T6.2.1`, `T6.2.2`

**Files:**
- Create: deterministic ranker, match/consent/disclosure repositories and APIs, anonymized previews, opportunity/match pages, authorized conversations, inbox, and chat

**Interfaces:**

```ts
export interface MatchSignals {
  semantic: number
  niche: number
  audience: number
  location: number
  rate: number
  workingStyle: number
}

export function rankCreators(
  campaign: Campaign,
  creators: readonly CreatorProfile[],
  embeddings: ReadonlyMap<string, readonly number[]>,
): readonly RankedCreator[]

export function acceptIntroduction(
  matchId: string,
  creatorContext: RequestContext,
): Promise<{ conversationId: string }>
```

- [ ] **Step 1: Write ranker tests with frozen vectors.** Test hard exclusions before scoring, explicit weights, stable ID tie-break, rate overlap, unavailable/unpublished exclusion, and unchanged results under input permutation.
- [ ] **Step 2: Implement embedding signals plus deterministic filters and weighting.** Superlinked never authorizes disclosure or mutates match state.
- [ ] **Step 3: Write match consent/rules/API tests.** Brands see anonymized fit reasons, creators see campaign summaries, decline reveals nothing, acceptance reveals only permitted fields and opens one conversation, and feedback is recorded without automatic retraining.
- [ ] **Step 4: Implement authorized real-time conversation storage and APIs.** Only accepted counterparties and allowlisted administrators can read; rate limiting and idempotency protect sends.
- [ ] **Step 5: Build bilingual match, opportunity, inbox, and chat UI.** Do not show exact internal scores, star ratings, swipe controls, or a creator catalog.
- [ ] **Step 6: Run T6 catalog verification and commit each stage.** Serialize the two Firestore-rules stages as declared by dependencies.

## Task 7: Offers, Delivery, Stripe Connect, and Manual Intervention

**Stages:** `T7.1.1`, `T7.1.2`, `T7.2.1`, `T7.2.2`, `T7.3.1`, `T7.3.2`

**Files:**
- Create: versioned offers, deal event machine, Stripe adapter/webhooks/ledger, Connect and funding UI, delivery/revision/dispute APIs and UI, protected administrator scripts

**Interfaces:**

```ts
import type Stripe from 'stripe'

export function calculateCheckoutAmounts(creatorAmountMinor: number): Readonly<{
  creatorAmountMinor: number
  serviceFeeMinor: number
  chargeAmountMinor: number
}>

export function applyDealEvent(
  current: Deal,
  event: DealEvent,
  actor: RequestContext,
): Deal

export function requireCreatorConnectReady(
  creatorUid: string,
): Promise<{ accountId: string; payoutsEnabled: true }>

export function handleStripeEvent(
  event: Stripe.Event,
): Promise<{ duplicate: boolean; dealId: string | null }>
```

The service fee uses nearest-penny half-up rounding: `Math.floor((creatorAmountMinor * 10 + 50) / 100)`. Tests lock examples at boundary values before payment code is written.

- [ ] **Step 1: Write failing pure money, acceptance, and state-machine tests.** Cover both acceptance orders, edits clearing both acceptances, idempotent events, legal cancellation/dispute paths, terminal states, amount limits, fee rounding, creator/brand authorization, and denial of creator acceptance until Stripe reports Connect payouts enabled.
- [ ] **Step 2: Implement Stripe-hosted Connect onboarding/readiness before versioned offer acceptance.** The server validates readiness when the creator accepts a first paid offer; clients request transitions and never assert readiness themselves.
- [ ] **Step 3: Implement versioned offers and append-only deal events, then write the remaining Stripe adapter/webhook tests.** Cover Checkout amount, duplicate webhook success, out-of-order events, ledger reconciliation, processing-fee absorption, test timed release, and live auto-release denial.
- [ ] **Step 4: Implement Checkout, webhook authority, ledger, and protected interventions.** Never infer payment state from a browser return URL.
- [ ] **Step 5: Build Connect readiness, offer, funding, delivery, revision, status, and dispute UI.** File uploads remain excluded; delivery is an external URL.
- [ ] **Step 6: Run the complete Stripe test-mode deal E2E.** Two distinct accounts proceed from mutual acceptance through funding, delivery, approval, payout, commission reconciliation, and completion.
- [ ] **Step 7: Commit each T7 stage independently.** Live payment activation remains a separate human decision after T8.

## Task 8: Development, Staging, and Production-Safe Testing Guide

**Stages:** `T8.1.1`, `T8.2.1`, `T8.2.2`, `T8.3.1`, `T8.3.2`

**Files:**
- Create: `docs/testing/manual/CASE-FORMAT.md`, capability guides `00` through `70`, evidence and rollback guides
- Create: `scripts/verify/manual-guide.mjs`, tests/fixtures, T8 Playwright suites, and platform runbook integration tests

**Interfaces:**

```ts
export interface ManualTestCase {
  id: string
  environments: readonly ('development' | 'staging' | 'production')[]
  prerequisites: readonly string[]
  identities: readonly string[]
  actions: readonly string[]
  expected: readonly string[]
  evidence: readonly string[]
  diagnosis: readonly string[]
  cleanup: readonly string[]
  rollback: readonly string[]
}

export function validateManualGuide(markdown: string): readonly string[]
```

- [ ] **Step 1: Write validator fixtures and failing tests.** Reject missing sections, duplicate IDs, unsafe real-payment actions, credential-shaped strings, unbounded destructive commands, and production tests that mutate private customer data.
- [ ] **Step 2: Implement the guide validator and case format.** Every case states environment, identity, exact action, observable result, evidence, diagnosis, cleanup, and rollback.
- [ ] **Step 3: Write the bilingual product journey guides.** Cover marketing, waitlist, invitation, both auth methods, both roles, voice/text, consent denial, interruption, recording/transcript/playback/deletion/export, editing, matching, disclosure, chat, offers, delivery, revision, and dispute.
- [ ] **Step 4: Write service, security, payment, and administrator guides.** Cover provider recovery, the 90-day purge and upstream deletion, authorization denial, rules, rate limits, audit events, Stripe test actions, webhook replay, refund, reversal, transfer, payout, and reconciliation.
- [ ] **Step 5: Write browser, accessibility, environment, evidence, cleanup, and rollback guides.** Cover Chrome, Firefox, WebKit/Safari, mobile profiles, keyboard, WCAG AA, reduced motion, responsive states, emulators, staging, and read-only/denial-only production smoke tests.
- [ ] **Step 6: Run every T8 automated and manual-guide verification command.** A skipped required external check is blocked, not passed. Production never charges real money before explicit live-payment approval.
- [ ] **Step 7: Run the adversarial review gate against the full spec, resolve every concrete finding, and commit.** Use `test: complete T8 — development and production-safe verification guide`.

## Execution Order and Checkpoints

1. Agent 1 claims `T0.1.1`; after it lands, Agent 1 and Agent 2 follow their derived-ready queues.
2. Each claim is committed to the owning runtime state on shared `main` before an implementation branch starts.
3. Only one stage may be active per agent. A four-hour lease requires a heartbeat before expiry.
4. Each task's terminal integration stage is a checkpoint where the designated owner consolidates discoveries into `.claude/memory.md`.
5. T2 stops at the waitlist human gate. T7 uses Stripe test mode. T8 production checks are read-only or denial-only until live payments receive separate approval.
6. Reassignment is a three-file coordination commit with an incremented assignment epoch; it is never inferred from an expired lease.

## Final Acceptance

- Both agent queues validate against the immutable global schedule and total weights remain within 10%.
- All four tiers pass for every completed stage, with Tier 2 always present.
- English and Spanish creator/brand journeys pass from waitlist through a reconciled Stripe test-mode payout.
- Recording/transcript privacy, deletion, export, authorization, and retention tests pass.
- Superlinked performs real smoke work behind a typed boundary; deterministic code owns ranking and workflow decisions.
- A sanitized Hermes receipt proves substantive coding-partner work without exposing secrets.
- T8 reproduces every major capability in development and staging and provides production-safe smoke, cleanup, diagnosis, and rollback instructions.
