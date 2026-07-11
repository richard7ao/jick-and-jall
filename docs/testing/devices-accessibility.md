# Devices and accessibility recovery manual test guide

## Scope
Cross-device/browser behavior, accessibility, reduced motion, and error recovery
across the public and authenticated surfaces.

## Preconditions
- `pnpm install`; build: `pnpm --filter @jj/web build`.
- Test matrix: latest Chrome/Safari/Firefox on desktop; iOS Safari and Android Chrome on mobile.

## Automated verification
| Tier | Command |
| --- | --- |
| Foundation/UI (unit) | `pnpm --filter @jj/web test --run tests/foundation` |
| E2E (when browsers cached) | `pnpm --filter @jj/web exec playwright test e2e/foundation.spec.ts` |

## Manual checks
1. Layouts are usable at 320px, 768px, and 1280px widths without horizontal scroll.
2. Keyboard-only: skip link works, focus order is logical, focus ring is always visible.
3. Screen reader announces landmarks, headings, form labels, and status/alert regions.
4. `prefers-reduced-motion` disables non-essential animation.
5. Error and loading states render and recover (retry) on flaky network; offline shows a graceful message.
6. English and Spanish both render correctly with no clipped or overflowing text.
