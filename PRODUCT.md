# Product

## Register

brand

## Users

**Creators (Jick side):** Social media creators — Instagram, TikTok, YouTube — ranging from micro-UGC
creators (no large following required) to macro influencers and brand ambassadors. They use the product
to build a persistent, evolving voice profile and get matched with paid brand partnerships without cold
outreach. They're on their phones, between shoots, wanting deals — not filling out spreadsheets.

**Brands (Jall side):** Marketing managers, agency media buyers, DTC brand founders. They have campaign
budgets and need authentic creator content fast. They use Jall to convert a rough campaign idea into a
structured brief with evaluation criteria, then receive a ranked list of matched creators. They want ROI
clarity, not a catalog to scroll.

## Product Purpose

Jick & Jall is a two-sided AI matchmaking platform connecting social media creators to brand sponsorships,
UGC campaigns, and ambassador programs. Jick (the creator agent) voice-interviews creators to build a
persistent profile — platforms, niche, rates, audience, vibe. Jall (the brand agent) voice-interviews
brand representatives to generate a structured campaign brief with creator evaluation criteria.

A continuous retrieval-and-ranking pipeline scores creators against each brief (skills, content style,
audience fit, working preferences, rate alignment) and updates from brand feedback (shortlist/pass).
An orchestration layer handles consent-gated Jick↔Jall introductions, outreach, and pipeline state.

Auth runs through Firebase. Voice agents use ElevenLabs. The agent harness is Hermes (Node/TS).

Success = a creator gets a deal they would not have found themselves. A brand gets creator content that
converts. The platform facilitates both without either party doing the legwork.

## Brand Personality

Bold. Playful. Fast.

The brand moves at creator economy speed. It's confident, a little irreverent, not corporate. It should
feel like the smartest person in the room who also knows how to have fun — not a B2B SaaS dashboard.

Voice: Direct, punchy, no jargon. Copy is short. CTAs are confident.

Emotional goals: Creators feel seen and valued (not like inventory). Brands feel in control and excited
(not like they're guessing). Both feel like they found something new and better.

## Anti-references

- **Generic SaaS (Linear, Notion, Airtable aesthetic):** No sterile neutral-on-white productivity tool
  look. No gray sidebar + card grid + muted type.
- **Influencer marketplaces (AspireIQ, Grin, Creator.co):** No boring catalog-scroll UI, no star ratings
  on creator cards, no "search 10,000 influencers" browse interface.
- **Corporate ATS / HR tools:** The Jack & Jill origin should be invisible. This is creator economy,
  not enterprise recruiting.
- **Dating app gimmick:** The two-sided match model must not look like Tinder. No swipe UI,
  no heart buttons, no "it's a match" confetti.

## Design Principles

1. **Move at creator speed.** Every interaction should feel instant. Voice > forms. One tap > five fields.
   If a creator has to fill in a long form, we've already lost them.

2. **Both sides are the hero.** The UI never makes creators feel like inventory or brands feel like
   clients. Both sides get a premium, personalized experience with their own entry point and voice.

3. **Intelligence should be invisible.** The AI matching, ranking, and brief generation should surface
   as clean outputs — not "AI-generated" badges and loading spinners. The product just works.

4. **Earn trust with precision.** Brands are spending money. Creators are protecting their reputation.
   Every match, every brief, every outreach message must feel intentional — not algorithmic noise.

5. **The waitlist is the first impression.** The landing page and waitlist are the product until
   v1 ships. They should fully embody the brand: bold, confident, and specific about what the
   product does differently.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum
- Reduced motion support for all animations
- Creator profile voice agent must have a text fallback (not every creator is comfortable with voice)
- Brand brief intake must work on mobile (brand reps are often on the go)
- Color palette must pass contrast for both dark and light surfaces
