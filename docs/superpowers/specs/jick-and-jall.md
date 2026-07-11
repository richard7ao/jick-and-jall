# Jick & Jall — Build Spec

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          jick-and-jall/                             │
│                                                                     │
│  apps/                                                              │
│    web/          Next.js 14 (App Router) — landing + app            │
│                                                                     │
│  packages/                                                          │
│    agents/       Hermes agent harness (Node/TS) — Jick + Jall       │
│    db/           Firestore schema + typed accessors                 │
│    auth/         Firebase Auth helpers (shared)                     │
│    voice/        ElevenLabs client wrapper                          │
│    shared/       Types, constants, utils                            │
│                                                                     │
│  infra/          Firebase config, Firestore rules, env templates    │
└─────────────────────────────────────────────────────────────────────┘
```

**Key services:**
- **Firebase Auth** — email/password + magic link; phone verification via Firebase
- **Firestore** — creator profiles, brand briefs, match records, waitlist entries
- **ElevenLabs** — conversational voice agents for Jick (creator onboarding) and Jall (brand brief intake)
- **Hermes** — Node/TS agent harness orchestrating Jick agent, Jall agent, matching pipeline, and intro flow
- **Next.js API routes** — thin BFF layer, calls Hermes agents and Firestore
- **Vercel** — hosting + edge functions

---

## T1 — Foundation & Monorepo Setup

**Description:** Bootstrap the monorepo, install tooling, configure Firebase project, and verify
the local dev environment is fully functional end-to-end.

### T1.1 — Monorepo scaffold

**Description:** Initialize pnpm workspace with apps/web and packages/* directories, ESLint, Prettier,
TypeScript base config, and turbo pipeline.

#### T1.1.1 — pnpm workspace init

**Description:** Create `pnpm-workspace.yaml`, root `package.json`, `turbo.json`, `.nvmrc`, `.prettierrc`,
`eslint.config.mjs`. No app code yet — just the shell.

**Verify:**

```bash
# tier1_build
pnpm install && pnpm turbo build --dry-run 2>&1 | grep -q "turbo"
```

```bash
# tier2_simplify
echo "No changed UI files — simplify skipped for scaffold-only stage"
```

```bash
# tier3_unit
pnpm tsc --noEmit --project tsconfig.json 2>&1 | tail -5
```

```bash
# tier4_integration
# No integration surface yet; covered when apps/web boots in T1.2.1
echo "SKIP: no integration surface at scaffold stage"
```

#### T1.1.2 — packages/shared scaffold

**Description:** Create `packages/shared` with barrel exports, shared TypeScript types
(Creator, Brand, WaitlistEntry, MatchRecord, VoiceSession), and zod schemas.

**Requires:** T1.1.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/shared build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
pnpm --filter @jj/shared test
```

```bash
# tier4_integration
echo "SKIP: pure types package, no integration surface"
```

### T1.2 — Next.js app shell

**Description:** Scaffold `apps/web` with Next.js 14 App Router, Tailwind CSS, and a working
dev server that renders a minimal root layout.

#### T1.2.1 — Next.js bootstrap

**Description:** `create-next-app` inside `apps/web`, configure Tailwind, add `@jj/shared` as
workspace dep, verify dev server starts and returns 200.

**Requires:** T1.1.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -10
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json apps/web/app/layout.tsx apps/web/app/page.tsx
```

```bash
# tier3_unit
pnpm --filter @jj/web lint
```

```bash
# tier4_integration
# Start dev server and curl root
PORT=3001 pnpm --filter @jj/web dev &
sleep 8 && curl -sf http://localhost:3001 | grep -q "html" && echo "PASS" || echo "FAIL"
```

### T1.3 — Firebase project setup

**Description:** Initialize Firebase project, configure Auth (email + phone), Firestore with
security rules, and wire environment variables into the Next.js app.

#### T1.3.1 — Firebase SDK + env config

**Description:** Install firebase + firebase-admin SDKs in packages/auth and packages/db.
Create `infra/firebase/` with `firestore.rules`, `firebase.json`, `.env.example`.

**Requires:** T1.2.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/auth build && pnpm --filter @jj/db build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
# Validate firestore.rules syntax
firebase --project demo-jj firestore:rules:validate infra/firebase/firestore.rules 2>&1 | grep -iv "error" && echo "PASS"
```

```bash
# tier4_integration
# Spin up Firebase emulator and verify connection
firebase emulators:start --only auth,firestore --project demo-jj &
sleep 10
curl -sf http://localhost:4000 | grep -q "Emulator" && echo "PASS" || echo "FAIL"
```

---

## T2 — Marketing Landing Page + Waitlist

**Description:** Build the public-facing landing page and waitlist signup flow. This is the first
impression and primary user acquisition channel until v1 ships. Bold, fast, on-brand.

### T2.1 — Design system

**Description:** Establish the visual identity: OKLCH color tokens, typography, spacing scale,
motion primitives. All subsequent UI stages consume these tokens.

#### T2.1.1 — PRODUCT.md + DESIGN.md

**Description:** PRODUCT.md already written (T0). Run `/impeccable document` to generate
DESIGN.md capturing palette, type, components.

**Requires:** T1.2.1

**Verify:**

```bash
# tier1_build
test -f DESIGN.md && echo "PASS" || echo "FAIL: DESIGN.md missing"
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/context.mjs 2>&1 | grep -q "DESIGN"
```

```bash
# tier3_unit
echo "SKIP: docs-only stage, no behavior to unit test"
```

```bash
# tier4_integration
echo "SKIP: docs-only stage"
```

#### T2.1.2 — Design tokens (CSS + Tailwind config)

**Description:** Write `apps/web/styles/tokens.css` with OKLCH CSS custom properties for color,
typography, spacing, radius, shadow, z-index. Extend Tailwind config to consume these tokens.

**Requires:** T2.1.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json apps/web/styles/tokens.css apps/web/tailwind.config.ts
```

```bash
# tier3_unit
# Verify token file has no duplicate custom properties
node -e "
const fs = require('fs');
const css = fs.readFileSync('apps/web/styles/tokens.css','utf8');
const props = css.match(/--[\w-]+(?=\s*:)/g) || [];
const dupes = props.filter((p,i) => props.indexOf(p) !== i);
if (dupes.length) { console.error('Duplicate tokens:', dupes); process.exit(1); }
console.log('PASS — no duplicates');
"
```

```bash
# tier4_integration
# Covered when landing page renders in T2.2
echo "SKIP: tokens integration verified in T2.2.1"
```

### T2.2 — Landing page

**Description:** Build the full marketing landing page: hero, how-it-works, two-sided value props
(Jick / Jall), social proof placeholder, and CTA to waitlist.

#### T2.2.1 — Hero section

**Description:** Full-bleed hero with headline, subhead, dual CTAs (Join as Creator / Join as Brand),
and animated brand mark. Motion-first but respects prefers-reduced-motion.

**Requires:** T2.1.2

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json apps/web/app/page.tsx apps/web/components/hero.tsx
```

```bash
# tier3_unit
pnpm --filter @jj/web lint -- --max-warnings 0
```

```bash
# tier4_integration
PORT=3001 pnpm --filter @jj/web dev &
sleep 8
curl -sf http://localhost:3001 | grep -q "Jick" && echo "PASS" || echo "FAIL"
```

#### T2.2.2 — How it works + value prop sections

**Description:** Two-sided value prop section (creator side / brand side), how-it-works 3-step
flow, and feature highlights. No identical card grids — use varied layout.

**Requires:** T2.2.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json apps/web/components/how-it-works.tsx apps/web/components/value-props.tsx
```

```bash
# tier3_unit
pnpm --filter @jj/web lint -- --max-warnings 0
```

```bash
# tier4_integration
PORT=3001 pnpm --filter @jj/web dev &
sleep 8
curl -sf http://localhost:3001 | grep -qi "creator\|brand" && echo "PASS" || echo "FAIL"
```

### T2.3 — Waitlist flow

**Description:** Multi-step waitlist form: email → phone → intent qualification → confirmation.
Persists to Firestore. Firebase phone verification for phone numbers.

#### T2.3.1 — Waitlist API route

**Description:** `POST /api/waitlist` — validates email, phone, side (creator/brand), and
qualification data; writes to Firestore `waitlist` collection; returns position number.

**Requires:** T1.3.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
echo "No UI files in this stage — simplify skipped"
```

```bash
# tier3_unit
# Test the API handler logic directly (mock Firestore)
pnpm --filter @jj/web test -- --testPathPattern=waitlist
```

```bash
# tier4_integration
# Start emulators + dev server, POST to waitlist, verify Firestore write
firebase emulators:start --only firestore --project demo-jj &
PORT=3001 pnpm --filter @jj/web dev &
sleep 12
curl -sf -X POST http://localhost:3001/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","phone":"+15551234567","side":"creator","niche":"fashion","platforms":["instagram"],"followerRange":"10k-50k"}' \
  | grep -q "position" && echo "PASS" || echo "FAIL"
```

#### T2.3.2 — Waitlist UI (multi-step form)

**Description:** React multi-step form component. Step 1: email. Step 2: phone + Firebase SMS
verification. Step 3: intent questions (branched by creator/brand side). Step 4: confirmation +
position in queue.

**Requires:** T2.3.1, T2.2.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json apps/web/components/waitlist-form.tsx
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=waitlist-form
```

```bash
# tier4_integration
PORT=3001 pnpm --filter @jj/web dev &
sleep 8
curl -sf http://localhost:3001 | grep -q "waitlist\|Join" && echo "PASS" || echo "FAIL"
```

---

## T3 — Firebase Auth + App Shell

**Description:** Authentication gates the app (creator dashboard + brand dashboard). Firebase Auth
with email/password and magic link. Protected routes via Next.js middleware.

### T3.1 — Auth flow

**Description:** Sign-up / sign-in pages, Firebase Auth integration, session cookies via
firebase-admin, and Next.js middleware route protection.

#### T3.1.1 — Auth pages (sign-up / sign-in)

**Description:** `app/(auth)/sign-up/page.tsx` and `app/(auth)/sign-in/page.tsx`. Forms handled
by Firebase Auth SDK. Redirect to onboarding after first sign-up.

**Requires:** T1.3.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(auth)/sign-up/page.tsx" "apps/web/app/(auth)/sign-in/page.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=auth
```

```bash
# tier4_integration
firebase emulators:start --only auth --project demo-jj &
PORT=3001 pnpm --filter @jj/web dev &
sleep 12
curl -sf http://localhost:3001/sign-in | grep -q "html" && echo "PASS" || echo "FAIL"
```

#### T3.1.2 — Middleware + protected routes

**Description:** `apps/web/middleware.ts` reads Firebase session cookie, redirects unauthenticated
users from `/app/*` routes to `/sign-in`. Redirects authenticated users from auth pages to app.

**Requires:** T3.1.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json apps/web/middleware.ts
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=middleware
```

```bash
# tier4_integration
PORT=3001 pnpm --filter @jj/web dev &
sleep 8
# Unauthenticated request to /app should redirect to /sign-in
LOCATION=$(curl -sf -o /dev/null -w "%{redirect_url}" http://localhost:3001/app)
echo "$LOCATION" | grep -q "sign-in" && echo "PASS" || echo "FAIL: got $LOCATION"
```

### T3.2 — App shell

**Description:** Dual-shell layout: creator shell (`/app/creator/*`) and brand shell (`/app/brand/*`).
Persistent nav, user context via React context, side-switching if a user has both roles.

#### T3.2.1 — Creator app shell

**Description:** `app/(app)/creator/layout.tsx` with sidebar nav (Profile, Matches, Conversations,
Settings). Uses design tokens. Responsive — collapses to bottom tab bar on mobile.

**Requires:** T3.1.2, T2.1.2

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/creator/layout.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web lint -- --max-warnings 0
```

```bash
# tier4_integration
# Covered when creator onboarding is tested in T4
echo "SKIP: shell integration verified in T4.1"
```

#### T3.2.2 — Brand app shell

**Description:** `app/(app)/brand/layout.tsx` with nav (Brief, Matches, Pipeline, Settings).
Mirrors creator shell structure; different nav items and brand-side color accent.

**Requires:** T3.1.2, T2.1.2

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/brand/layout.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web lint -- --max-warnings 0
```

```bash
# tier4_integration
echo "SKIP: shell integration verified in T5.1"
```

---

## T4 — Jick: Creator Voice Agent + Profile

**Description:** Jick is the creator-side voice agent. ElevenLabs conducts an onboarding interview
that populates a structured creator profile in Firestore. Hermes orchestrates the session.

### T4.1 — packages/voice (ElevenLabs client)

**Description:** Create `packages/voice` — typed ElevenLabs Conversational AI SDK wrapper.
Handles session creation, transcript streaming, and structured data extraction from transcripts.

#### T4.1.1 — ElevenLabs wrapper

**Description:** Thin wrapper around `@elevenlabs/client` or REST API. Exports `startVoiceSession`,
`getTranscript`, `endSession`. Handles auth with ELEVENLABS_API_KEY env var.

**Requires:** T1.1.2

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/voice build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
pnpm --filter @jj/voice test
```

```bash
# tier4_integration
# Requires ELEVENLABS_API_KEY in env — skip in CI if not set
[ -z "$ELEVENLABS_API_KEY" ] && echo "SKIP: no API key" && exit 0
pnpm --filter @jj/voice test:integration
```

### T4.2 — packages/agents (Hermes harness)

**Description:** Install and configure Hermes. Define Jick agent: voice interview script, transcript
parser, profile schema mapper. Define Jall agent (stub for T5).

#### T4.2.1 — Hermes setup + Jick agent

**Description:** Install hermes (`hermes-agent` npm package or from source). Create
`packages/agents/src/jick.ts` — agent definition with ElevenLabs voice session, transcript-to-profile
extractor using zod schema, and Firestore write on completion.

**Requires:** T4.1.1, T1.3.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
pnpm --filter @jj/agents test -- --testPathPattern=jick
```

```bash
# tier4_integration
# Run Jick agent with a mock transcript fixture; assert Firestore write shape
firebase emulators:start --only firestore --project demo-jj &
sleep 8
pnpm --filter @jj/agents test:integration -- --testPathPattern=jick
```

### T4.3 — Creator onboarding UI

**Description:** `/app/creator/onboard` page — triggers the Jick voice agent, shows live transcript,
confirms extracted profile, and saves. Text fallback if voice is declined.

#### T4.3.1 — Voice onboarding page

**Description:** `app/(app)/creator/onboard/page.tsx`. Voice start button → ElevenLabs WebRTC
session → live transcript overlay → extracted profile preview → confirm/edit → save to Firestore.

**Requires:** T4.2.1, T3.2.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/creator/onboard/page.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=onboard
```

```bash
# tier4_integration
# Covered by manual QA with ElevenLabs sandbox; API key required
echo "SKIP: requires ElevenLabs key + audio device; covered in manual QA"
```

---

## T5 — Jall: Brand Voice Agent + Brief

**Description:** Jall is the brand-side voice agent. ElevenLabs interviews a brand rep to produce a
structured campaign brief with creator evaluation criteria. Hermes orchestrates the session.

### T5.1 — Jall agent

**Description:** Create `packages/agents/src/jall.ts` — brand brief intake agent. Mirrors Jick
architecture. Brief schema: campaign goals, target audience, content format, budget range, creator
criteria, timeline.

#### T5.1.1 — Jall agent definition

**Description:** Jall agent in Hermes. Voice interview → brief schema extraction (zod) → Firestore
write to `briefs/{briefId}`. Returns structured `CampaignBrief` type.

**Requires:** T4.2.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
pnpm --filter @jj/agents test -- --testPathPattern=jall
```

```bash
# tier4_integration
firebase emulators:start --only firestore --project demo-jj &
sleep 8
pnpm --filter @jj/agents test:integration -- --testPathPattern=jall
```

### T5.2 — Brand brief intake UI

**Description:** `/app/brand/brief` — voice-driven brief creation page. Same UX pattern as creator
onboarding but from the brand perspective. Text fallback available.

#### T5.2.1 — Brief intake page

**Description:** `app/(app)/brand/brief/page.tsx`. Launch Jall voice session → live transcript →
extracted brief preview → confirm/edit → save. Redirect to matches dashboard on completion.

**Requires:** T5.1.1, T3.2.2

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/brand/brief/page.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=brief
```

```bash
# tier4_integration
echo "SKIP: requires ElevenLabs key + audio device; covered in manual QA"
```

---

## T6 — Matching Pipeline

**Description:** The core intelligence layer. Score creators against campaign briefs on skills,
content style, audience fit, rate alignment, and working preferences. Update from brand feedback.

### T6.1 — Scoring engine

**Description:** `packages/agents/src/matching.ts` — vector similarity + rule-based scorer.
Takes a `CampaignBrief` and a list of `CreatorProfile`s; returns ranked `MatchRecord[]`.

#### T6.1.1 — Scoring function

**Description:** Implement matching scorer. Use cosine similarity on embedding vectors for
niche/style fit; hard filters for rate range, platform, follower count; weighted sum for final score.
Embeddings generated via OpenAI text-embedding-3-small (or Voyage AI — kept internal).

**Requires:** T4.2.1, T5.1.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
# Given fixture creator profiles + brief, assert top match is correct
pnpm --filter @jj/agents test -- --testPathPattern=matching
```

```bash
# tier4_integration
# Run scorer against Firestore emulator data seeded with fixtures
firebase emulators:start --only firestore --project demo-jj &
sleep 8
pnpm --filter @jj/agents test:integration -- --testPathPattern=matching
```

#### T6.1.2 — Feedback loop (shortlist/pass)

**Description:** `POST /api/matches/[matchId]/feedback` route. Brand sends shortlist/pass decision;
agent updates match record and re-ranks remaining candidates using the feedback signal.

**Requires:** T6.1.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=feedback
```

```bash
# tier4_integration
firebase emulators:start --only firestore --project demo-jj &
PORT=3001 pnpm --filter @jj/web dev &
sleep 12
curl -sf -X POST http://localhost:3001/api/matches/test-match-id/feedback \
  -H "Content-Type: application/json" \
  -d '{"decision":"shortlist","reason":"Great niche fit"}' \
  | grep -q "updated\|success" && echo "PASS" || echo "FAIL"
```

### T6.2 — Match dashboards

**Description:** Surface ranked matches on both sides. Brand sees creator cards ranked by score.
Creator sees brand opportunities ranked by relevance.

#### T6.2.1 — Brand matches dashboard

**Description:** `/app/brand/matches` — ranked creator list with score breakdown, campaign brief
context, and shortlist/pass actions. Not a grid of identical cards.

**Requires:** T6.1.1, T5.2.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/brand/matches/page.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=brand-matches
```

```bash
# tier4_integration
firebase emulators:start --only firestore --project demo-jj &
PORT=3001 pnpm --filter @jj/web dev &
sleep 12
curl -sf http://localhost:3001/app/brand/matches | grep -q "html" && echo "PASS" || echo "FAIL"
```

#### T6.2.2 — Creator opportunities dashboard

**Description:** `/app/creator/matches` — brand opportunities the creator has been matched to,
with fit score, brand brief summary, and accept/pass CTA.

**Requires:** T6.1.1, T4.3.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/creator/matches/page.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=creator-matches
```

```bash
# tier4_integration
firebase emulators:start --only firestore --project demo-jj &
PORT=3001 pnpm --filter @jj/web dev &
sleep 12
curl -sf http://localhost:3001/app/creator/matches | grep -q "html" && echo "PASS" || echo "FAIL"
```

---

## T7 — Orchestration: Consent-Gated Introductions

**Description:** When a brand shortlists a creator, the orchestration layer handles consent,
introduction message, and pipeline state transition. Creator must accept before any contact data
is exchanged.

### T7.1 — Introduction flow

**Description:** Hermes orchestration agent manages the state machine: Match created → Brand shortlists
→ Creator notified → Creator accepts/declines → Introduction sent (if accepted) → Pipeline advances.

#### T7.1.1 — Introduction state machine

**Description:** `packages/agents/src/orchestrator.ts`. State machine with states:
matched → shortlisted → creator_notified → intro_sent | declined. Firebase Cloud Functions
trigger on Firestore writes to advance state.

**Requires:** T6.1.2

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/agents build
```

```bash
# tier2_simplify
echo "No UI files — simplify skipped"
```

```bash
# tier3_unit
pnpm --filter @jj/agents test -- --testPathPattern=orchestrator
```

```bash
# tier4_integration
firebase emulators:start --only firestore,functions --project demo-jj &
sleep 12
pnpm --filter @jj/agents test:integration -- --testPathPattern=orchestrator
```

#### T7.1.2 — Creator accept/decline UI

**Description:** Notification page + action for creators: see brand brief summary (no contact data
yet), accept or decline the introduction. On accept, both parties get email with contact info.

**Requires:** T7.1.1, T4.3.1

**Verify:**

```bash
# tier1_build
pnpm --filter @jj/web build 2>&1 | tail -5
```

```bash
# tier2_simplify
node /Users/richardlao/.claude/skills/impeccable/scripts/detect.mjs --json "apps/web/app/(app)/creator/introductions/page.tsx"
```

```bash
# tier3_unit
pnpm --filter @jj/web test -- --testPathPattern=introductions
```

```bash
# tier4_integration
firebase emulators:start --only firestore,auth --project demo-jj &
PORT=3001 pnpm --filter @jj/web dev &
sleep 12
curl -sf http://localhost:3001/app/creator/introductions | grep -q "html" && echo "PASS" || echo "FAIL"
```

---

## Decision Log

| Decision | Rationale |
|---|---|
| Next.js 14 App Router | SSR for landing/SEO + RSC for app. Single deployment to Vercel. |
| pnpm workspaces + turbo | Monorepo keeps agents/web/db in sync without version drift. |
| Firebase Auth + Firestore | Generous free tier, real-time subscriptions, phone auth built-in. Avoids separate auth server. |
| ElevenLabs Conversational AI | Native conversational voice agent SDK — better than raw TTS + STT for interview UX. |
| Hermes (Node/TS) | Same language as frontend — no context switch. TS types shared via packages/shared. |
| Embedding provider | Not disclosed publicly. Internal to packages/agents. |
| OKLCH tokens | Perceptually uniform, better dark mode math than HSL. |
| Waitlist first | Zero infra cost, validates both sides before building the full product loop. |
