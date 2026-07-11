# 70 — Browser Matrix, Accessibility & Recovery

Automated companion: `e2e/t8-browser-accessibility.spec.ts`.

## Browser matrix

Verify on latest Chrome, Safari, Firefox, and a mobile browser (iOS Safari /
Android Chrome). Check layout, fonts, and interactions at 360px and 1280px.

## Accessibility

1. Every page sets `<html lang>` to the active locale.
2. All form fields have associated labels; errors use `role="alert"` and are
   linked with `aria-describedby`.
3. Keyboard-only: Tab reaches all controls; role radios move with Arrow keys;
   focus is visible.
4. Colour contrast meets WCAG AA (see DESIGN.md contrast notes).
5. Images are decorative (`alt=""`/`aria-hidden`) or have meaningful alt text.

## Error & recovery

1. Unknown path under a locale renders the 404 with a working "Go home" link.
2. A thrown render error shows the error boundary with a working "Try again".
3. An interrupted interview is recovered on reload.
4. A failed network submit surfaces a retry-friendly message (never a silent
   failure).
