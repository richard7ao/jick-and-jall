# Design

## Theme

Dark. Near-pure-black background with electric acid-chartreuse as the primary brand color.
The palette reads like a ring-lit creator's phone screen at 6pm — electric, confident, nothing safe.

Color strategy: **Committed**. The chartreuse carries 30–60% of hero surfaces; neutrals hold space around it,
never diluting it. The coral-orange accent marks the Jall (brand) side; chartreuse marks the Jick (creator) side.

## Colors

```css
:root {
  /* Background architecture */
  --color-bg:      oklch(0.07 0.000 0);    /* near-pure black */
  --color-surface: oklch(0.12 0.000 0);    /* lifted surface for panels/cards */
  --color-border:  oklch(0.20 0.000 0);    /* subtle separator */

  /* Brand colors */
  --color-primary: oklch(0.82 0.21 110);   /* electric acid-chartreuse (Jick / creator side) */
  --color-accent:  oklch(0.68 0.18 25);    /* electric coral-orange (Jall / brand side) */

  /* Text */
  --color-ink:     oklch(0.97 0.000 0);    /* near-pure white — body copy */
  --color-muted:   oklch(0.58 0.000 0);    /* secondary text — ≥3.5:1 on bg */
  --color-dim:     oklch(0.38 0.000 0);    /* tertiary / disabled */

  /* Text-on-fills (saturated fills use white text per H-K effect) */
  --color-on-primary: oklch(0.07 0.000 0); /* dark bg on chartreuse — L 0.82 is pale, dark text */
  --color-on-accent:  oklch(0.97 0.000 0); /* white text on coral — L 0.68 is mid, white wins */

  /* Z-index scale */
  --z-dropdown:       100;
  --z-sticky:         200;
  --z-modal-backdrop: 300;
  --z-modal:          400;
  --z-toast:          500;
  --z-tooltip:        600;
}
```

**Contrast checks:**
- `--color-ink` on `--color-bg`: ~14:1 ✓ (WCAG AAA)
- `--color-muted` on `--color-bg`: ~4.1:1 ✓ (WCAG AA large text; use at ≥16px)
- `--color-primary` as button bg with `--color-on-primary` (dark): L 0.82 is pale enough for dark text ✓
- `--color-accent` as button bg with `--color-on-accent` (white): L 0.68 mid-luminance + C 0.18 → white text per H-K ✓
- `--color-primary` vs `--color-accent`: hue 110° vs 25° (85° apart), L 0.82 vs 0.68 → clearly distinct ✓

## Typography

**Font pair:** Barlow Condensed (display) + Geist (body/UI)

Barlow Condensed: highway-sign confidence, condensed punchy headlines, zero editorial-magazine reading.
Geist: geometric precision body type, technically legible at small sizes, not on reflex list.

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800&family=Geist:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body:    'Geist', sans-serif;

  /* Type scale (fluid clamp — 1.333 ratio) */
  --text-xs:   clamp(0.694rem, 0.65vw + 0.55rem,  0.800rem);
  --text-sm:   clamp(0.833rem, 0.75vw + 0.65rem,  0.938rem);
  --text-base: clamp(1.000rem, 0.90vw + 0.78rem,  1.125rem);
  --text-lg:   clamp(1.200rem, 1.10vw + 0.94rem,  1.375rem);
  --text-xl:   clamp(1.440rem, 1.40vw + 1.10rem,  1.750rem);
  --text-2xl:  clamp(1.728rem, 1.80vw + 1.30rem,  2.250rem);
  --text-3xl:  clamp(2.074rem, 2.40vw + 1.55rem,  3.000rem);
  --text-4xl:  clamp(2.488rem, 3.50vw + 1.80rem,  4.000rem);
  --text-5xl:  clamp(2.986rem, 5.00vw + 2.00rem,  5.500rem);
  --text-hero: clamp(3.583rem, 7.00vw + 2.20rem,  6.000rem); /* max 6rem — ceiling respected */

  /* Leading */
  --leading-tight:  1.1;
  --leading-snug:   1.25;
  --leading-normal: 1.5;
  --leading-loose:  1.7;

  /* Tracking */
  --tracking-tight:  -0.03em;
  --tracking-normal:  0em;
  --tracking-wide:    0.04em;
  --tracking-wider:   0.08em;
}

/* Display headings always use Barlow Condensed */
h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: var(--tracking-tight); /* ≥ -0.04em floor respected */
  text-wrap: balance;
}

/* Body always Geist */
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-ink);
  background-color: var(--color-bg);
  text-wrap: pretty;
}

/* Body line length cap */
p, li { max-width: 68ch; }
```

## Spacing

```css
:root {
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */

  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:  12px;
  --radius-xl:  20px;
  --radius-full: 9999px;
}
```

## Components

### Button

Two variants. Primary uses chartreuse fill with dark text. Ghost uses transparent with ink border.

```css
.btn {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-base);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.btn:active { transform: scale(0.97); }

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.btn-primary:hover { opacity: 0.88; }

.btn-ghost {
  background: transparent;
  color: var(--color-ink);
  border-color: var(--color-border);
}

.btn-ghost:hover {
  border-color: var(--color-ink);
}

.btn-accent {
  background: var(--color-accent);
  color: var(--color-on-accent);
  border-color: var(--color-accent);
}
```

### Side pill (Jick / Jall indicator)

Used to distinguish the two agent sides. Small pill label.

```css
.pill {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
}

.pill-jick {
  background: oklch(0.82 0.21 110 / 0.15);
  color: var(--color-primary);
  border: 1px solid oklch(0.82 0.21 110 / 0.30);
}

.pill-jall {
  background: oklch(0.68 0.18 25 / 0.15);
  color: var(--color-accent);
  border: 1px solid oklch(0.68 0.18 25 / 0.30);
}
```

### Input

```css
.input {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  transition: border-color 0.15s ease-out;
}

.input::placeholder { color: var(--color-muted); }

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}
```

### Section dividers

No eyebrow labels on every section. Use generous vertical spacing + subtle border-top for rhythm.

```css
.section {
  padding-block: clamp(var(--space-16), 8vw, var(--space-32));
}

.section + .section {
  border-top: 1px solid var(--color-border);
}
```

## Motion

Library: **Motion (Framer Motion)** for React components. Lenis for smooth scroll on the landing page.

```css
/* Easing tokens — ease-out-quart for most; expo for dramatic entrances */
:root {
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);

  --duration-fast:   150ms;
  --duration-normal: 280ms;
  --duration-slow:   500ms;
  --duration-enter:  600ms;
}

/* Reduced motion — swap all transitions to instant crossfade */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Motion principles for Jick & Jall:**
- Landing page hero: single orchestrated entrance (wordmark scales up, headline reveals line by line, CTAs fade in). One sequence, not per-section reflex.
- Voice agent session: pulsing ring animation on the microphone icon (clip-path or box-shadow, not layout).
- Matching pipeline: staggered list reveal for ranked matches — stagger is legitimate here, it's a list.
- Waitlist form: step transitions use horizontal slide (translateX), not fade. Speed of the step change communicates the product's pace.

## Imagery direction

This is a brand surface — imagery is required. No colored div placeholders.

**Creator side (Jick):** Raw, unpolished-on-purpose. Behind-the-scenes creator content: phone propped
up, ring light off-center, natural light in apartments. Capture the work, not the glamor.

**Brand side (Jall):** Clean glass-table DTC product flat-lays, campaign mood boards, the controlled
version. Contrast with Jick deliberately.

**Stock source:** Unsplash. Verify URLs before use.

## Tailwind config extension

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{tsx,ts}', './components/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        bg:       'oklch(0.07 0.000 0)',
        surface:  'oklch(0.12 0.000 0)',
        border:   'oklch(0.20 0.000 0)',
        primary:  'oklch(0.82 0.21 110)',
        accent:   'oklch(0.68 0.18 25)',
        ink:      'oklch(0.97 0.000 0)',
        muted:    'oklch(0.58 0.000 0)',
        dim:      'oklch(0.38 0.000 0)',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body:    ['Geist', 'sans-serif'],
      },
      letterSpacing: {
        tight:  '-0.03em',
        normal:  '0em',
        wide:    '0.04em',
        wider:   '0.08em',
      },
    },
  },
} satisfies Config
```
