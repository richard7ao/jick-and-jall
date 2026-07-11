# Jick & Jall — Manual Test System

Structured manual acceptance guides that complement the automated suites
(`apps/web/e2e/*`, unit tests). Each guide lists prerequisites, numbered steps,
and expected results, and never requires exposing secrets or personal data.

## Index

| Guide | Area |
| --- | --- |
| `00-environments.md` | Environments, accounts, and safety rules |
| `10-marketing-waitlist-auth.md` | Public surface, waitlist, sign-in/register |
| `20-onboarding-media-profiles.md` | Jick/Jall onboarding, recordings, profiles |
| `30-matching-chat-deals.md` | Matching, consent, chat, offers, deals |
| `70-browser-accessibility-recovery.md` | Browser matrix, a11y, error recovery |
| `EVIDENCE.md` | How to capture and store review evidence |
| `ROLLBACK.md` | How to roll back a bad deploy safely |

## Contract for every guide

- State the environment and any required role accounts (creator and brand are
  separate accounts with immutable roles).
- Test English and Spanish; they must be behaviorally equivalent.
- Test desktop and mobile widths.
- Never paste secrets, tokens, signed URLs, emails, or recordings into notes or
  screenshots.
- Payments are test-mode only until the separate live-payment gate is approved.
