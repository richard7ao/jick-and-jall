# Jick & Jall Agent Operating Manual

This file is the project-level extension to the global Agent Operating Manual.
Its v3 coordination rules override the global manual's v2 `tasks/state.json`
protocol. All other global safety, test, simplification, post-mortem, and
adversarial-review requirements remain active.

## Sources of truth

Read these in order at the start of every implementation session:

1. `.claude/memory.md`
2. `docs/superpowers/specs/2026-07-11-jick-and-jall-v1-design.md`
3. `docs/superpowers/plans/2026-07-11-jick-and-jall-v1.md`
4. `docs/superpowers/specs/jick-and-jall-v1.md`
5. `tasks/state.json`
6. The runtime file selected by the immutable local `JJ_AGENT_ID`

The v1 files above supersede the historical
`docs/superpowers/specs/jick-and-jall.md`. Do not initialize or repair a v2
task tree.

## Toolchain verified by the plan

| Tool | Project baseline |
| --- | --- |
| Node.js | 22 |
| pnpm | 10, pinned by `packageManager` and the lockfile |
| Next.js | 16 App Router |
| React | 19 |
| TypeScript | Strict mode |
| Tailwind CSS | 4 |
| Firebase emulator project | `demo-jj` |

T0 creates the executable workspace and pins exact dependency patch versions
in `pnpm-lock.yaml`. Do not change a dependency outside the stage that owns the
root manifest and lockfile.

## v3 state protocol

Exactly three committed state files exist:

- `tasks/state.json`: stable global schedule; read-only during normal work.
- `tasks/state-agent-1.json`: Agent 1 runtime evidence; writable only when
  `JJ_AGENT_ID=agent-1`.
- `tasks/state-agent-2.json`: Agent 2 runtime evidence; writable only when
  `JJ_AGENT_ID=agent-2`.

The global file owns stage IDs, assignment epochs, queue order, dependencies,
gate requirements, weights, scopes, and verification command references. It
does not store `current_task`, `current_step`, `current_stage`, aggregate
statuses, claims, evidence, or post-mortems. Read-only reporting derives those
values from all three files.

The per-agent `queue` is a validated mirror of globally assigned active stages,
sorted by `queue_rank`. `ready` is derived and is never persisted.

### Session start

1. Confirm `JJ_AGENT_ID` is exactly `agent-1` or `agent-2`; never infer it from
   a hostname, branch, directory, or previous session.
2. Fetch shared `main` and read all sources of truth.
3. Run `pnpm state:validate` after T0.1.1 makes that command available.
4. Resolve any unresolved post-mortem in the local agent runtime before a new
   claim.
5. Select only an owned, derived-ready stage with satisfied dependencies,
   approved gates, and collision-free scopes.

### Claim and branch

1. Record a claim in the owning runtime file with current assignment epoch,
   branch, base commit, claim/heartbeat timestamps, and four-hour expiry.
2. Merge the claim-only runtime commit to shared `main`. A claim that exists
   only on a local implementation branch reserves nothing.
3. Refetch `main`, validate the claim, and create a branch such as
   `agent-1/T4.2.1-creator-onboarding` at the recorded base commit.
4. Each agent may hold at most one active claim.
5. Heartbeat through an own-runtime-only `main` commit before lease expiry,
   then rebase the implementation branch.

Lease expiry never transfers ownership. It produces a stale blocked claim that
requires explicit release, reassignment, or human override.

### Write scopes

Scopes are normalized repo-relative exact files or directory trees. Absolute
paths, `..`, symlink traversal, arbitrary globs, and negated patterns are
invalid.

Two scopes collide when files are equal, a file lies inside a tree, or either
tree is an ancestor of the other. Collision checks include valid held claims in
both runtime files. Every changed path since the recorded base commit must fit
the claimed scopes, except the owning agent may also update its own runtime
file.

Agent 1 primarily owns non-API pages/components. Agent 2 owns packages,
Firebase, scripts, and route handlers under `apps/web/app/api`. These lane
descriptions are not scopes; the exact stage scopes are authoritative.

### Implementation and verification

For every stage:

1. Write a behavior test that fails for the intended reason.
2. Implement the smallest change that satisfies the stage.
3. Run Tier 1 build/validation.
4. Dispatch `code-simplifier:code-simplifier` over every changed file, resolve
   all findings, then run the Tier 2 evidence assertion.
5. Run Tier 3 behavior tests.
6. Run Tier 4 integration in context.
7. Commit the verified candidate code, record hashes and redacted evidence in
   the owning runtime file, and merge code plus evidence together.

Tier 2 is never optional. If its named reviewer is unavailable, record a
`verification` blocker and stop. `not_applicable` is valid only when the global
schedule marks a tier non-required and gives a reason; no current Tier 2 entry
is non-required.

Each Tier 2 record has an `evidence` field. A passing record contains exactly:

- `reviewer`: `code-simplifier:code-simplifier`;
- `base_commit`: the claim's base commit;
- `changed_files_sha256`: the SHA-256 of a sorted manifest containing each
  changed repo-relative path and its final content SHA-256;
- `reviewer_prompt_sha256`: the hash of the exact review request;
- `reviewed_at`: an ISO 8601 timestamp;
- `findings_count`: a non-negative integer after all findings are resolved;
- `result`: `passed`.

Record Tier 2 evidence only after the simplifier has reviewed the final file
contents. Any subsequent content change invalidates the manifest and requires a
new review. `state:assert-review` recomputes the manifest and verifies the
reviewer, claim base, and hashes; this also applies to bootstrap stage T0.1.1
after that stage creates the assertion command.

All tier evidence stores command references and hashes, exit codes, timestamps,
and a short redacted summary. Never store raw output, provider bodies,
credentials, emails, signed URLs, transcripts, recordings, or machine-local
paths.

Three failures with the same tier and root-cause key require an unresolved
verification post-mortem and a blocked stage. Do not attempt a fourth fix in
the same session.

### Completion and memory

A stage is complete only when all required tiers pass, all changed files are in
scope, all post-mortems are resolved, and its `verified_commit` is reachable
from shared `main`. Completion changes only the owning runtime record; task and
step status remain derived.

Ordinary stages record discoveries in runtime checkpoints. The terminal
integration stage for each task consolidates durable decisions, patterns,
gotchas, and open questions into `.claude/memory.md`; this avoids a shared
memory-file hot spot.

### Human gates and reassignment

`G2.WAITLIST_APPROVAL` is defined globally and recorded by Agent 1. It blocks
the first two T3 stages until the user explicitly approves the deployed
English/Spanish waitlist. Tests cannot approve it.

Reassignment is the only normal exception to global immutability. A coordinator
uses one atomic commit to increment the global assignment epoch, supersede the
old runtime record, initialize the new owner record, and update both queues.
Work that was never pushed cannot be represented as recovered.

## Server lifecycle

- Unit tests use deterministic fakes and do not start managed services.
- Firebase integration uses `pnpm firebase:exec -- COMMAND` so emulators are
  started with bounded readiness and always stopped.
- Playwright owns its local Next.js server through `webServer`; do not leave a
  background server running after tests.
- Designated T0/T8 live smoke checks are bounded, redacted, and never run in
  ordinary CI.
- Stripe production checks are read-only or denial-only until the separate
  live-payment gate is approved.

## Project-Specific Constraints (ABSOLUTE — no exceptions)

| Rule | Reason |
| --- | --- |
| TypeScript owns authorization, routing, retries, filtering, weights, money, and state transitions | Model output is untrusted judgment, not workflow authority |
| Superlinked is the primary generation/embedding provider; Hermes is developer-side only | Prevents a second production orchestrator and satisfies the hackathon safely |
| Firebase Auth, Firestore, and private Storage are the only v1 application backend | Avoids split identity and data authority |
| Creator and brand use separate accounts with immutable roles | Consent, disclosure, and payment authorization depend on unambiguous identity |
| English and Spanish must remain behaviorally equivalent | Bilingual support is a release requirement, not translated decoration |
| Only registered published available creators may be ranked | External discovery and cold outreach are excluded from v1 |
| The brand pays creator amount plus 10%; all amounts are GBP integer minor units | Financial reconciliation must be deterministic |
| Live automatic payout, refund, reversal, and dispute resolution remain disabled | Human terms and operational approval are not complete |
| Recordings are private and default to 90-day retention; deletion propagates upstream | Voice data requires explicit consent and bounded retention |
| No secret or private content enters Git, logs, state, fixtures, receipts, or screenshots | The repository and coordination files are shared across machines |
| Do not reproduce Jack & Jill branding, copy, claims, data, testimonials, or recruitment workflows | Reference assets are structural inspiration only |
