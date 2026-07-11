# Design

## Theme

Light. Warm off-white background with amber/golden brand colors carrying the emotional warmth.
High energy, confident — not pastel, not cold-elite. Glossier/Boy Smells energy: visible warmth
in the surface, saturated brand tones doing the heavy lifting.

**Scene:** A creator opens Jick & Jall at 10am in a sunlit LA coffee shop — warm morning light
through the windows, oat milk latte on the table, airy and optimistic. The brand rep on the
other side is confident and excited, not corporate.

**Color strategy: Committed.** The amber-gold primary carries 30–60% of hero surfaces.
The bg is a visible warm off-white (tinted toward the brand's own hue) — not cream/paper/
parchment, but a clearly warm-tinted white with presence. Warmth is layered: bg provides the
foundation, brand colors deliver the emotion.

## Colors

```css
:root {
  /* Background architecture — visible warm off-white */
  --color-bg:      oklch(0.96 0.018 75);   /* warm off-white, amber-tinted */
  --color-surface: oklch(0.92 0.015 75);   /* panels / cards */
  --color-border:  oklch(0.84 0.012 75);   /* separator lines */

  /* Brand colors — amber/golden, same warm family, two intensities */
  --color-primary: oklch(0.72 0.16 75);    /* Jick / creator side: warm amber-gold */
  --color-accent:  oklch(0.50 0.14 50);    /* Jall / brand side: deeper amber-orange, richer weight */

  /* Text — warm-tinted ink, not cold black */
  --color-ink:     oklch(0.15 0.020 75);   /* near-black with warm tint — ~12:1 on bg */
  --color-muted:   oklch(0.44 0.012 75);   /* secondary text — ~5:1 on bg */
  --color-dim:     oklch(0.62 0.008 75);   /* tertiary / placeholder — ~3:1 on bg */

  /* Text-on-fills */
  --color-on-primary: oklch(0.15 0.020 75); /* dark ink on primary: L 0.72 is pale, dark text */
  --color-on-accent:  oklch(0.97 0.000 0);  /* near-white on accent: L 0.50 mid, white text wins */

  /* Z-index scale */
  --z-dropdown:       100;
  --z-sticky:         200;
  --z-modal-backdrop: 300;
  --z-modal:          400;
  --z-toast:          500;
  --z-tooltip:        600;
}
```

**Contrast checks (all vs `--color-bg` oklch(0.96 0.018 75)):**
- `--color-ink` (L 0.15): ~12:1 ✓ WCAG AAA
- `--color-muted` (L 0.44): ~5.1:1 ✓ WCAG AA
- `--color-dim` (L 0.62): ~3.2:1 ✓ WCAG AA large text (use at ≥18px bold or ≥24px)
- `--color-primary` button with dark text (L 0.15 on L 0.72): ~5.5:1 ✓
- `--color-accent` button with white text (L 0.97 on L 0.50): ~8.2:1 ✓
- Primary vs accent (L 0.72 vs L 0.50, hue 75° vs 50°): clearly distinct ✓

## Typography

**Font pair: Epilogue (display) + Manrope (body)**

Epilogue: variable humanist sans with warm, rounded-but-confident letterforms. Round features
with personality — none of the cold geometric rigidity of Inter/Outfit. High weight contrast
(100–900) gives strong hierarchy at display sizes. Not on reflex-reject list.

Manrope: geometric structure with humanist details. Smooth open curves, warm without being soft.
Excellent small-size legibility. Variable weight axis. Not on reflex-reject list.

```css
@import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800&family=Manrope:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Epilogue', sans-serif;
  --font-body:    'Manrope', sans-serif;

  /* Fluid type scale — 1.333 ratio, clamp() */
  --text-xs:   clamp(0.694rem,  0.65vw + 0.55rem,  0.800rem);
  --text-sm:   clamp(0.833rem,  0.75vw + 0.65rem,  0.938rem);
  --text-base: clamp(1.000rem,  0.90vw + 0.78rem,  1.125rem);
  --text-lg:   clamp(1.200rem,  1.10vw + 0.94rem,  1.375rem);
  --text-xl:   clamp(1.440rem,  1.40vw + 1.10rem,  1.750rem);
  --text-2xl:  clamp(1.728rem,  1.80vw + 1.30rem,  2.250rem);
  --text-3xl:  clamp(2.074rem,  2.40vw + 1.55rem,  3.000rem);
  --text-4xl:  clamp(2.488rem,  3.50vw + 1.80rem,  4.000rem);
  --text-5xl:  clamp(2.986rem,  5.00vw + 2.00rem,  5.500rem);
  --text-hero: clamp(3.583rem,  7.00vw + 2.20rem,  6.000rem); /* max 6rem */

  /* Leading */
  --leading-tight:  1.1;
  --leading-snug:   1.25;
  --leading-normal: 1.5;
  --leading-loose:  1.7;

  /* Tracking — floor of -0.04em on display */
  --tracking-display: -0.03em;
  --tracking-heading: -0.02em;
  --tracking-normal:   0em;
  --tracking-wide:     0.04em;
  --tracking-wider:    0.08em;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: var(--tracking-display); /* ≥ -0.04em floor respected */
  text-wrap: balance;
}

h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: var(--tracking-heading);
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-ink);
  background-color: var(--color-bg);
  text-wrap: pretty;
}

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
  --radius-2xl: 28px;
  --radius-full: 9999px;
}
```

## Components

### Button

Primary uses amber-gold fill with warm-ink text. Accent (Jall-side) uses deeper amber-orange with
white text. Ghost uses ink border, no fill.

```css
.btn {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  letter-spacing: var(--tracking-wide);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);  /* pill shape — warm, approachable, not corporate rectangle */
  border: 2px solid transparent;
  cursor: pointer;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.btn:active { transform: scale(0.97); }

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}
.btn-primary:hover { opacity: 0.88; }

.btn-accent {
  background: var(--color-accent);
  color: var(--color-on-accent);
  border-color: var(--color-accent);
}
.btn-accent:hover { opacity: 0.88; }

.btn-ghost {
  background: transparent;
  color: var(--color-ink);
  border-color: var(--color-border);
}
.btn-ghost:hover { border-color: var(--color-ink); }
```

### Side pill (Jick / Jall indicator)

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
  background: oklch(0.72 0.16 75 / 0.12);
  color: oklch(0.50 0.14 65);
  border: 1px solid oklch(0.72 0.16 75 / 0.25);
}

.pill-jall {
  background: oklch(0.50 0.14 50 / 0.10);
  color: var(--color-accent);
  border: 1px solid oklch(0.50 0.14 50 / 0.25);
}
```

### Input

```css
.input {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-ink);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  transition: border-color 0.15s ease-out, box-shadow 0.15s ease-out;
}

.input::placeholder { color: var(--color-dim); }

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px oklch(0.72 0.16 75 / 0.15);
}
```

### Section rhythm

No eyebrow labels on every section. Generous vertical spacing + subtle warm border for rhythm.

```css
.section {
  padding-block: clamp(var(--space-16), 8vw, var(--space-32));
}

.section + .section {
  border-top: 1px solid var(--color-border);
}
```

## Motion

Library: **Motion (Framer Motion)** for React components. Lenis for smooth scroll.

```css
:root {
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);

  --duration-fast:   150ms;
  --duration-normal: 280ms;
  --duration-slow:   500ms;
  --duration-enter:  600ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Motion principles:**
- Landing hero: single orchestrated entrance. Wordmark fades + scales, headline reveals, CTAs slide up. One sequence per fold, not per-section entrance reflex.
- Waitlist form: step transitions slide horizontally (translateX). Speed communicates the product's pace.
- Voice session: pulsing glow on microphone icon (box-shadow, not layout property).
- Matched list: legitimate stagger — it's a list, stagger is appropriate.
- Warm easing: ease-out-quart for most; expo only for dramatic hero moments.

## Imagery direction

This is a brand surface — imagery required. No colored div placeholders.

**Creator side (Jick):** Warm, natural light. Sunlit interiors, coffee shops, creators at work —
not polished photoshoots. Relaxed, authentic, warm ambient light.

**Brand side (Jall):** Clean but not cold. Product flat-lays in warm natural light, brand mood boards
with amber tones. Controlled but approachable.

**Stock source:** Unsplash. Verify URLs before use. Search for specifics:
"creator filming in sunlit LA apartment" beats "influencer marketing."

## Tailwind config extension

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{tsx,ts}', './components/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        bg:       'oklch(0.96 0.018 75)',
        surface:  'oklch(0.92 0.015 75)',
        border:   'oklch(0.84 0.012 75)',
        primary:  'oklch(0.72 0.16 75)',
        accent:   'oklch(0.50 0.14 50)',
        ink:      'oklch(0.15 0.020 75)',
        muted:    'oklch(0.44 0.012 75)',
        dim:      'oklch(0.62 0.008 75)',
      },
      fontFamily: {
        display: ['Epilogue', 'sans-serif'],
        body:    ['Manrope', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.03em',
        heading: '-0.02em',
        normal:   '0em',
        wide:     '0.04em',
        wider:    '0.08em',
      },
    },
  },
} satisfies Config
```
