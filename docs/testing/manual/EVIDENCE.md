# Evidence Capture

How to record manual-test evidence for a release or a human gate.

## What to capture

- Environment + commit SHA under test.
- Pass/fail per guide with the tester and date.
- Screenshots of key states (marketing en/es, waitlist success, onboarding
  preview, matches, a funded deal), desktop and mobile.

## What must NEVER appear in evidence

- Secrets, API keys, tokens, signed URLs.
- Real personal data: emails, names, phone numbers, recordings, transcripts.
- Machine-local absolute paths.

Redact anything sensitive before saving. Store evidence in the agreed review
location (not in this repository).

## Format

```
Release: <sha>  Env: <env>  Date: <YYYY-MM-DD>  Tester: <name>
- 10-marketing-waitlist-auth: PASS/FAIL (notes)
- 20-onboarding-media-profiles: PASS/FAIL
- 30-matching-chat-deals: PASS/FAIL
- 70-browser-accessibility-recovery: PASS/FAIL
```
