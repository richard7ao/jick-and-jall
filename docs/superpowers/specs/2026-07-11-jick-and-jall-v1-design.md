# Jick & Jall v1 — Product and Delivery Design

**Status:** Approved for implementation planning
**Date:** 2026-07-11
**Supersedes for planning:** `docs/superpowers/specs/jick-and-jall.md`

## 1. Purpose

Jick & Jall is a two-sided creator marketplace. Jick helps a creator build a
persistent profile and find paid opportunities. Jall helps a brand turn a rough
campaign idea into a structured brief and find suitable creators. The product
supports consent-based introductions, negotiation, a funded deal, delivery,
approval, and creator payout.

The v1 objective is one complete and demonstrable transaction:

1. A brand creates a campaign brief with Jall.
2. The matching service combines Superlinked embeddings with deterministic
   filters and weighting to rank registered creators.
3. A creator consents to an introduction.
4. Both parties agree to a structured offer in chat.
5. The brand funds the deal in Stripe test mode.
6. The creator submits a deliverable link.
7. The brand approves it.
8. Jick & Jall records its commission and transfers the creator's share.

## 2. Product boundaries

### Included in v1

- A public bilingual marketing site and low-friction waitlist.
- Manual waitlist approval and invitation through protected scripts.
- Separate creator and brand accounts.
- Google sign-in as the primary method and email/password as fallback.
- Bilingual English and Spanish UI, email, validation, and voice flows.
- Jick creator onboarding by voice or text.
- Jall brand and campaign onboarding by voice or text.
- Stored transcripts and recordings with explicit consent and deletion support.
- Superlinked generation and embeddings behind a typed TypeScript client.
- Ranking of creators already registered in Jick & Jall.
- Consent-gated profile disclosure and introduction.
- In-app text chat, structured offers, and versioned acceptance.
- Stripe Connect test-mode funding and creator payout.
- A 10% service fee paid by the brand on top of the creator's agreed amount.
- Manual dispute, refund, and payout intervention through protected scripts.
- A complete T8 guide for development, staging, and production-safe testing.
- Parallel implementation from two computers with isolated state ownership.

### Excluded from v1

- Discovering or scraping creators who are not registered.
- Automated cold outreach or off-platform invitation campaigns.
- Multiple roles on one Firebase account.
- Native mobile applications.
- Languages other than English and Spanish.
- File attachments in chat or hosted deliverable files.
- Milestones, split payments, partial delivery, or multiple payouts per deal.
- Automated dispute adjudication.
- Custom legal-document editing or third-party e-signature integration.
- Automatic learning from shortlist/pass feedback.
- A waitlist administration dashboard.
- Real-money hackathon transactions.
- Mubit, Supabase, or a second application backend.

## 3. Users and identity

### Creator account

A creator account has one immutable `creator` role. A creator cannot use the
same Firebase account as a brand. Jick produces a creator profile containing a
bio, platforms, handles, niche, content formats, audience, location,
availability, rate range, working preferences, and portfolio links. Every
generated field remains editable before publication.

### Brand account

A brand account has one immutable `brand` role. Jall produces a general brand
profile and campaign briefs containing goals, deliverables, target audience,
platforms, creator criteria, budget, usage rights, schedule, location, and the
approval contact. Every generated field remains editable before publication.

### Invitation gate

Joining the waitlist does not create a Firebase account. The waitlist requires
only role, email, and consent; name and qualification details are optional.
Approval is deliberately manual. A protected script lists entries, records an
approval or rejection, and creates a single-use invitation valid for seven
days. Registration must use the invited email address. Uninvited Google users
return to the waitlist.

## 4. Core journeys

### Creator journey

Waitlist and invitation → account → Jick voice/text interview → editable
profile → matched opportunity → consent to introduction → chat → accept
structured offer → brand funds deal → submit external deliverable link → brand
approval or dispute → payout → complete.

### Brand journey

Waitlist and invitation → account → Jall voice/text interview → editable brand
profile and campaign brief → ranked registered creators → request introduction
→ creator consent → chat → send structured offer → both parties accept → fund
deal → review external deliverable → approve, request the included revision, or
open a dispute → complete.

### Deal state machine

```text
draft
  -> offered
  -> accepted_by_one_party
  -> mutually_accepted
  -> funded
  -> delivered
  -> revision_requested -> delivered
  -> approved
  -> payout_pending
  -> paid
  -> complete

Each offer version records creator and brand acceptance separately; either
party may accept first, and editing a term clears both acceptances.
Pre-funding states may enter cancelled when the offer's cancellation terms
permit. funded, delivered, or payout_pending may enter disputed. paid,
complete, and cancelled are terminal; disputed exits only through a recorded
administrator resolution.
```

All mutations are authenticated, authorized, idempotent, and appended to a
deal event log. Clients never advance payment state from redirect parameters;
Stripe webhooks are authoritative for financial transitions.

## 5. Experience and references

The screenshots under `jackandJillPics/` are internal structural references,
not public assets and not content to reproduce verbatim. The product preserves
their strongest interaction patterns:

- A clear two-sided entry point.
- Product UI shown directly on the marketing site.
- A persistent agent conversation beside the working context.
- A living profile generated from conversation.
- Inbox and pipeline views for active opportunities.
- Sparse navigation and direct calls to action.

Jick & Jall replaces recruitment language, logos, testimonials, claims, pricing,
and data. It also applies the warm amber identity in `DESIGN.md`; the neutral
recruitment aesthetic is not copied. No testimonial or partner logo appears
until genuine evidence exists.

The approved flow diagram is stored at
`docs/references/flows/creator-brand-v1.png`. Every reference asset remains in
the repository with a manifest describing its source, permitted use, and
elements to reuse or avoid. Production imagery is downloaded into the
repository with documented usage rights rather than hotlinked.

## 6. Technical architecture

### Runtime

- **Web and server:** Next.js 16 App Router on Vercel.
- **Language:** TypeScript for application orchestration and shared contracts.
- **Styling:** Tailwind CSS 4 consuming CSS design tokens.
- **Runtime baseline:** Node.js 22 and a pinned pnpm version.
- **Authentication:** Firebase Authentication with Google and email/password.
- **Database:** Cloud Firestore.
- **Media:** Cloud Storage for Firebase.
- **Voice:** ElevenLabs Agents with authenticated server-issued session tokens.
- **Generation and embeddings:** Superlinked SIE through its OpenAI-compatible
  chat and embedding endpoints.
- **Payments:** Stripe Connect and Stripe Checkout.
- **Email:** Resend.
- **Deployment:** Vercel for Next.js; Firebase remains the managed auth, data,
  emulator, and media platform.

Next.js route handlers own application APIs, session exchange, provider tokens,
webhooks, admin operations, and authorization. Firebase Cloud Functions are not
required for v1. Background-looking actions are represented by idempotent route
handlers and durable Firestore events; provider webhooks complete asynchronous
transitions.

### Monorepo boundaries

```text
apps/web                 Next.js UI and route handlers
packages/shared          Zod contracts, state machines, constants
packages/auth            Firebase client/admin session helpers
packages/db              Typed Firestore repositories
packages/voice           ElevenLabs client and session persistence
packages/agents          Jick, Jall, matching, and TypeScript orchestration
packages/payments        Stripe Connect, Checkout, webhooks, and ledger mapping
packages/email           Resend templates and delivery adapter
packages/test-support    Fixtures, emulator helpers, provider fakes
infra/firebase           Firebase, Firestore, Storage, and emulator config
docs/hackathon           Hermes evidence and demo material
docs/references          Local visual and flow references
tasks                    Global and per-agent execution state
```

Each package exposes a narrow typed interface. Application code never calls a
provider directly outside the package that owns that provider.

## 7. Superlinked and Hermes

### Superlinked

Superlinked is the primary generation and embedding provider. A typed client:

- Normalizes the configured base URL to `/v1`.
- Sends bearer authorization only to the configured host.
- Discovers generation and embedding models during T0.
- Uses the configured warm machine profile header when available.
- Retries only retryable capacity/model-loading failures and honors
  `Retry-After` within a bounded deadline.
- Requests JSON schema output and validates it with Zod.
- Redacts provider bodies from user-visible errors and secret-bearing logs.
- Supports deterministic fakes and frozen embeddings in automated tests.

Deterministic TypeScript owns routing, retries, authorization, state changes,
and provider fallback. The model is limited to extraction, classification,
ranking signals, explanations, and drafting.

### Hermes hackathon requirement

Hermes is a developer-side coding partner and backup, not a production runtime
dependency. T0 installs the official Hermes CLI, configures Superlinked as its
custom OpenAI-compatible provider, and verifies `hermes status`. Hermes must do
at least one substantive implementation or review task. A sanitized session
receipt is committed under `docs/hackathon/hermes-receipts/`; secrets, personal
paths, and unrelated conversation content are removed. This satisfies the
hackathon's coding-partner qualification without introducing a second deployed
backend.

## 8. T0 credentials and machine bootstrap

T0 runs separately on both computers. It creates ignored local environment
files from committed templates and checks only presence, format, and safe live
connectivity. It never prints secret values.

Required configuration categories are:

- Firebase public web configuration and server credentials.
- Firebase emulator project and ports.
- Superlinked base URL, bearer key, chat model, embedding model, and optional
  machine profile.
- ElevenLabs key plus Jick and Jall agent identifiers.
- Stripe publishable key, secret key, webhook secret, and Connect settings.
- Resend key, verified sender, and reply-to address.
- Administrator email allowlist.
- Vercel origins and production URLs.
- A local `JJ_AGENT_ID` of `agent-1` or `agent-2`.

The Superlinked key disclosed during planning is rotated before production.
No secret, credential JSON, signed URL, recording URL, or bearer token may
appear in Git, task state, test fixtures, screenshots, or receipts.

## 9. Data design

Primary Firestore collections are:

- `waitlistEntries`
- `invitations`
- `users`
- `creatorProfiles`
- `brandProfiles`
- `campaigns`
- `voiceSessions`
- `matches`
- `conversations/{id}/messages`
- `deals/{id}/events`
- `deliveries`
- `transactions`
- `notifications`
- `auditEvents`

Zod schemas in `packages/shared` define all stored and exchanged shapes. Typed
repositories in `packages/db` are the only application layer that reads or
writes Firestore. Every protected record carries its owning UID, role, created
and updated timestamps, schema version, and locale where relevant.

Financial records store provider IDs, currency, integer minor-unit amounts,
commission amount, creator amount, and status. They never store card or bank
details. Webhook event IDs provide idempotency.

## 10. Voice, recording, and localization

Voice onboarding supports English (`en`) and Spanish (`es`). Users select a
language and may change it before a session. The transcript retains the source
language; structured profile fields remain language-neutral where possible and
localized for display. Text fallback offers the same questions and outcomes as
voice.

Before recording starts, the UI explains what is recorded, why it is stored,
who can access it, its retention, and how to delete it. Consent records the
policy version, locale, timestamp, UID, and session ID.

- Firestore stores session metadata and structured transcript turns.
- Private Firebase Storage stores the recording at an owner-scoped path.
- Only the owner and an allowlisted administrator may access raw media.
- Recordings are retained for 90 days by default.
- Transcripts are retained while the account exists.
- Users may delete a session or request a complete export/deletion.
- Deletion removes Firestore turns and Storage objects, calls ElevenLabs'
  conversation-deletion endpoint, and retains only a non-content audit tombstone.
- No public or permanent download URL is stored.

T8 verifies both languages, text fallback, consent denial, interrupted sessions,
playback authorization, deletion, and export.

## 11. Matching and disclosure

Only registered, published, available creator profiles are eligible. Hard
filters cover required platform, content format, availability, and impossible
budget/rate overlap. Niche, audience, location, follower range, style, working
preferences, and rate fit are weighted signals.

Superlinked provides embeddings and similarity signals. Deterministic code
applies filters, weights, tie-breaking, and stable ordering. Unit tests use
frozen vectors and explicit expected rankings.

Brands initially see an anonymized preview with plain-language fit reasons such
as “strong platform and audience fit.” Exact numeric scores remain internal.
The creator sees the campaign summary and accepts or declines the introduction.
Only acceptance reveals the full permitted profile and opens chat. Shortlist,
pass, accept, and decline feedback is recorded but does not retrain or mutate
the v1 algorithm automatically. Administrators can create or suppress a match
through an audited script.

## 12. Chat, offers, delivery, and payments

Chat is a Firestore-backed text thread with links but no uploaded attachments.
An offer contains deliverables, creator amount, 10% brand service fee, currency,
deadline, one included revision, usage rights, cancellation terms, and expiry.
Editing an accepted term creates a new immutable version requiring both parties
to accept again.

The brand pays the creator amount plus the service fee through Stripe Checkout.
Jick & Jall absorbs Stripe processing costs from its fee. Stripe-hosted Connect
onboarding collects creator payout and identity information before the creator
accepts a first paid offer. The platform never handles those details.

V1 uses one payment and one payout. The creator submits an external deliverable
URL. The brand may approve it, request the single included revision, or open a
dispute. The approval window is seven days. Test mode exercises the intended
timed-release path. In live mode, automatic release remains disabled; payout
release, disputes, refunds, and transfer reversals remain manual,
authenticated, audited administrator actions until marketplace terms and
operational readiness are approved.

The initial market is the United Kingdom, GBP, adults 18 and over, with a
transaction range of £50–£10,000. Production payment activation is a separate
human approval gate.

## 13. Security and privacy

- Default-deny Firestore and Storage rules are tested against an explicit role
  and ownership matrix.
- Google and password credentials exchange a Firebase ID token for an HTTP-only,
  secure, same-site server session cookie through a CSRF-protected endpoint.
- Invitation, role, and ownership checks occur on every server mutation.
- Email enumeration protection and a Firebase password policy are enabled.
- Provider keys remain server-only; clients receive only short-lived scoped
  session tokens or signed operations.
- Recording and transcript access is owner-scoped and audited.
- Rate limiting protects waitlist, authentication-adjacent, provider-token,
  chat, offer, feedback, and payment endpoints.
- Audit events record administrative, consent, disclosure, deal, and financial
  actions without copying secrets or raw media.
- Privacy, marketplace, transaction, and recording terms ship before live
  payments.

## 14. Parallel two-computer delivery

### State ownership

The executable plan will use three committed state files:

- `tasks/state.json` is the stable global schedule and contains the spec path
  and hash, stage dependencies, owner, estimated weight, declared write scopes,
  and human gates.
- `tasks/state-agent-1.json` is writable only by Agent 1 and contains its queue,
  active stage, checkpoints, verification evidence, and post-mortems.
- `tasks/state-agent-2.json` is writable only by Agent 2 and contains the same
  structure for Agent 2.

Global task and step status is derived by a validator that reads all three
files. Agents do not rewrite aggregate status during normal work, eliminating a
shared hot spot. A report command renders current progress without modifying
files.

### Agent lanes

| Task | Agent 1 — product experience | Agent 2 — platform intelligence |
| --- | --- | --- |
| T0 | Toolchain, design references, bilingual UI | Firebase, providers, Stripe, Hermes |
| T1 | Next.js and frontend foundation | Schemas, repositories, rules, test infrastructure |
| T2 | Marketing and waitlist UI | Waitlist API, scripts, email, analytics |
| T3 | Authentication screens and app shells | Sessions, invitations, roles, media security |
| T4 | Creator onboarding and media UI | ElevenLabs, Jick, extraction, persistence |
| T5 | Brand onboarding and campaign UI | Jall, extraction, campaign persistence |
| T6 | Match, consent, inbox, and chat UI | Embeddings, ranking, feedback, match APIs |
| T7 | Offer, delivery, and payment-status UI | Deal machine, Stripe, webhooks, intervention |
| T8 | Bilingual journeys and device guide | Service, voice, payment, security, production guide |

Stages will be balanced by estimated weight, targeting totals within 10%, rather
than by raw count. Agent 1 primarily owns `apps/web/**`; Agent 2 owns
`packages/**`, `infra/**`, and `apps/web/app/api/**`. Root configuration and
shared-contract changes are explicit coordination stages. Shared schemas land
before their UI consumers.

### State transitions

Stage statuses are `pending`, `ready`, `claimed`, `in_progress`,
`awaiting_approval`, `blocked`, `complete`, `cancelled`, or `superseded`.
Verification tiers separately support `pending`, `running`, `passed`, `failed`,
or `not_applicable` with a reason.

Each agent-stage record includes owner, branch, base commit, spec hash, weight,
write scopes, start and update times, lease expiry, implementation phase,
current tier, attempts, command evidence, changed files, blockers, resumption
note, completion commit, and completion time. Parent statuses, ready stages, and
dependency satisfaction are derived.

### Working protocol

1. Each computer configures one immutable `JJ_AGENT_ID`.
2. It fetches `main`, validates all state, and selects an assigned ready stage.
3. It records a claim in its own state file and creates
   `agent-<n>/<stage-id>-<slug>` from the recorded base commit.
4. A validator rejects overlapping active `writes:` scopes.
5. The agent updates only its state file and its stage-owned code.
6. CI validates spec/state alignment, ownership, dependencies, write scopes,
   timestamps, verification evidence, and tests.
7. A completed branch merges atomically with its own state evidence.
8. Both computers fetch merged `main` before claiming another stage.
9. Integration gates after every task prevent either lane from outrunning the
   combined product.

Reassignment requires a coordination commit that updates the global owner and
both agent queues before implementation resumes. Secret files are configured
separately on each computer through a password manager, never through Git.

## 15. Task catalog

The executable implementation plan will replace the existing 25-stage catalog
with this T0–T8 structure:

- **T0 — Prerequisites, secrets, hackathon evidence, and two-computer state**
- **T1 — Supported monorepo, shared contracts, Firebase, and test foundation**
- **T2 — Bilingual marketing, waitlist, manual approval, and launch analytics**
- **T3 — Invitation-gated authentication, app shells, storage, and sessions**
- **T4 — Jick creator voice/text onboarding and stored media**
- **T5 — Jall brand profile and campaign brief onboarding**
- **T6 — Superlinked matching, consent, inbox, and chat**
- **T7 — Offers, deal state, delivery, Stripe Connect, and manual intervention**
- **T8 — Complete development, staging, and production testing guide**

T2 ends in an `awaiting_approval` human gate. T3 cannot begin merely because T2
tests pass. The user reviews the deployed waitlist and explicitly authorizes the
full application build.

## 16. Verification strategy

Every implementation stage has four verification tiers:

1. Build, typecheck, lint, or configuration validation.
2. Mandatory simplification review of every changed file.
3. Behavior-focused unit or contract tests.
4. Integration tests against the artifact in context.

Shell verification uses strict failure propagation, bounded readiness checks,
and guaranteed cleanup. Firebase tests use `firebase emulators:exec`. Provider
tests default to deterministic fakes; designated T0/T8 smoke tests exercise live
test credentials without printing them. A skipped external check is represented
as a blocked or explicitly not-applicable gate, never a successful `echo`.

The test stack is Vitest, Testing Library, Playwright, Firebase emulator test
utilities, and provider-specific fakes. CI and local commands use the same
scripts.

### T8 guide requirements

T8 is a repository-local guide organized by major capability. Every test lists
prerequisites, environment, test identity, exact actions, expected result,
evidence, failure diagnosis, cleanup, and rollback. It covers:

- English and Spanish marketing, waitlist, authentication, and emails.
- Creator and brand accounts with invitation enforcement.
- Voice and text onboarding, consent, recording, transcripts, playback,
  deletion, and export.
- Profile and brief editing.
- Matching, anonymized previews, consent, and disclosure.
- Inbox, chat, offers, versioning, delivery, revision, and dispute.
- Stripe test-mode onboarding, funding, webhook replay, refund, transfer, and
  payout.
- Administrator scripts and audit records.
- Security-rule denial cases, authorization boundaries, and rate limits.
- Chrome, Safari, and Firefox on desktop plus Safari and Chrome on mobile.
- Accessibility, keyboard use, reduced motion, responsive layout, and recovery
  from provider failures.
- Development emulators, staging deployment, and production-safe smoke tests.

Full payment flows run in Stripe test mode on staging. Production tests do not
charge real money until the separate live-payment gate is approved. Evidence
includes checklist outcome, screenshot, relevant record/provider IDs,
timestamp, cleanup action, and failure notes.

## 17. Error handling and resilience

- Missing T0 credentials place the owning stage in `blocked` with a redacted
  remediation message.
- Voice failure preserves partial transcript state and offers text continuation.
- Invalid model output fails schema validation and triggers a bounded retry or
  deterministic fallback; it is never silently filled with empty fields.
- Superlinked capacity failures honor retry guidance within a fixed deadline.
- Failed email creates a retryable notification record without rolling back the
  originating business transition.
- Duplicate provider webhooks return success after detecting an existing event.
- A payment or transfer inconsistency freezes the deal and requires manual
  review.
- Permission denial reveals no record existence or private metadata.
- Every retryable workflow records its idempotency key and last error category.

## 18. Acceptance criteria

The design is successfully implemented when:

- Both computers can claim and complete independent stages without editing the
  same state file or overlapping write scope.
- The entire creator and brand flow works in English and Spanish.
- Recordings and transcripts are stored privately, playable only by authorized
  users, and deletable.
- Superlinked performs real extraction and matching work through the typed
  TypeScript boundary.
- A sanitized Hermes receipt proves a substantive coding-partner task.
- A brand and creator complete a test-mode deal from brief to payout.
- Commission, creator proceeds, and all state transitions reconcile with Stripe
  webhook evidence.
- The T8 guide lets a person reproduce every major capability in development
  and on a deployed site.
- No required verification is silently skipped and no secret enters Git.

## 19. Migration from the existing plan

The current `docs/superpowers/specs/jick-and-jall.md` and v2 `tasks/state.json`
remain historical inputs until the implementation plan is approved. The next
planning step will:

1. Generate the detailed T0–T8 stage catalog with four explicit verify
   blocks per stage.
2. Balance weighted stages between Agent 1 and Agent 2.
3. Create the v3 global and per-agent state schemas.
4. Add the project-level operating manual that teaches future sessions how to
   read and update all three state files.
5. Validate stage IDs, dependencies, ownership, write scopes, and all terminal
   transitions before replacing the v2 runtime state.
