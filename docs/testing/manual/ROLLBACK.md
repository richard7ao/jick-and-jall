# Rollback

Safe recovery from a bad deploy. Rollback must never mutate or destroy user data.

## When to roll back

- A release breaks a core journey (marketing, waitlist, auth, onboarding, deals).
- A privacy regression is observed (PII in analytics/logs, media exposure).
- Payment behaviour deviates from test-mode expectations.

## Procedure

1. Re-point the environment to the previous known-good release (revert the deploy
   / promote the prior build). Do not force-push shared branches.
2. Confirm `state:validate` and the CI checks are green on the restored commit.
3. Verify the core journeys from guide `30` and the public surface from `10`.
4. Leave data migrations forward-compatible; never run a destructive down
   migration to roll back code.

## After rollback

- File the regression with the failing guide + evidence (redacted).
- Do not re-deploy until the fix has passing automated + manual checks.
