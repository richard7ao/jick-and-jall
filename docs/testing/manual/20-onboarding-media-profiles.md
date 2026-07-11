# 20 — Onboarding, Media & Profiles

Covers Jick (creator) and Jall (brand) onboarding, recordings, and editable
profiles. Automated: `e2e/jick-complete.spec.ts`, `e2e/jall-onboarding.spec.ts`,
`e2e/brand-edit-publish.spec.ts`.

## Creator (Jick)

1. `/en/creator/onboarding` → consent + language, then voice or text.
2. In text mode, answer the questions and `Finish & preview`.
3. Reload mid-interview → progress is recovered from the session.
4. Edit answers in preview → `Publish profile`.
5. `/en/creator/profile` → edit fields, save; recordings list shows an empty
   state when there are none, with playback + delete when present.
6. `/en/creator/settings/privacy` → 90-day retention note; export request shows a
   neutral confirmation.

## Brand (Jall)

1. `/en/brand/onboarding` → voice/text campaign intake → preview → publish.
2. `/en/brand/profile` and `/en/brand/campaigns` → edit; budget must be a whole
   amount £50–£10,000 or publish is blocked.

## Expected

- Both languages equivalent; recovery works; deletion/export are clearly neutral.
