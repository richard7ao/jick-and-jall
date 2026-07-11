# Manual test guide contract

Every guide under `docs/testing/` MUST contain these sections, in order:

## Scope
What capability the guide covers.

## Preconditions
Environment, credentials (referenced, never inlined), and build/setup steps.

## Automated verification
A table mapping each tier to the exact command(s).

## Manual checks
Numbered, observable checks — including English/Spanish and desktop/mobile where
relevant, plus accessibility (keyboard, screen reader, focus) expectations.

---

Validated by `pnpm guides:validate` (see `scripts/testing/validate-guides.mts`).
Guides must never inline secrets, tokens, signed URLs, or personal data.
