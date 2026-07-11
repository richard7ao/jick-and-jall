/**
 * App-local bilingual marketing microcopy.
 *
 * The core UI dictionary (hero/nav/footer/waitlist) lives in the repo-root
 * `content/*.json` single source; this module holds only the longer-form
 * marketing narrative that belongs to the web app. Both locales are defined
 * together so English/Spanish stay structurally equivalent (enforced by tests).
 */

import type { Locale } from "./i18n";

export interface MarketingStep {
  title: string;
  body: string;
}

export interface MarketingSide {
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
}

export interface MarketingContent {
  howItWorks: { title: string; steps: readonly MarketingStep[] };
  creator: MarketingSide;
  brand: MarketingSide;
  cta: { title: string; subtitle: string; action: string };
}

const en: MarketingContent = {
  howItWorks: {
    title: "How it works",
    steps: [
      {
        title: "Talk it through",
        body: "Jick interviews creators and Jall briefs brands — a short, natural voice conversation instead of a long form.",
      },
      {
        title: "We build the profile",
        body: "Your answers become a structured profile and campaign brief, kept editable and always in your control.",
      },
      {
        title: "Get matched",
        body: "We rank real, available creators against each brief — no cold outreach, no guesswork, just relevant fits.",
      },
    ],
  },
  creator: {
    eyebrow: "For creators",
    title: "Jick gets to know your work",
    body: "A relaxed voice interview captures your niche, voice, and rates. You stay in control of what is shared.",
    points: ["Voice-first onboarding", "Editable profile", "Only matched with relevant briefs"],
  },
  brand: {
    eyebrow: "For brands",
    title: "Jall shapes your brief",
    body: "Describe the campaign out loud and Jall turns it into a clear brief, then surfaces creators who actually fit.",
    points: [
      "Talk through the campaign",
      "Structured, editable brief",
      "Ranked, available creators",
    ],
  },
  cta: {
    title: "Be first in line",
    subtitle: "Join the waitlist and we will reach out as early access opens.",
    action: "Join the waitlist",
  },
};

const es: MarketingContent = {
  howItWorks: {
    title: "Cómo funciona",
    steps: [
      {
        title: "Cuéntanoslo",
        body: "Jick entrevista a creadores y Jall recoge el brief de las marcas — una conversación de voz breve y natural, no un formulario largo.",
      },
      {
        title: "Creamos el perfil",
        body: "Tus respuestas se convierten en un perfil estructurado y un brief de campaña, siempre editables y bajo tu control.",
      },
      {
        title: "Encuentra tu match",
        body: "Clasificamos creadores reales y disponibles para cada brief — sin contacto en frío ni conjeturas, solo coincidencias relevantes.",
      },
    ],
  },
  creator: {
    eyebrow: "Para creadores",
    title: "Jick conoce tu trabajo",
    body: "Una entrevista de voz relajada capta tu nicho, tu estilo y tus tarifas. Tú controlas lo que se comparte.",
    points: ["Onboarding por voz", "Perfil editable", "Solo coincidencias relevantes"],
  },
  brand: {
    eyebrow: "Para marcas",
    title: "Jall da forma a tu brief",
    body: "Describe la campaña en voz alta y Jall la convierte en un brief claro, y luego muestra creadores que encajan de verdad.",
    points: [
      "Habla de la campaña",
      "Brief estructurado y editable",
      "Creadores clasificados y disponibles",
    ],
  },
  cta: {
    title: "Sé el primero de la lista",
    subtitle: "Únete a la lista de espera y te contactaremos cuando abramos el acceso anticipado.",
    action: "Unirse a la lista",
  },
};

const marketingByLocale: Record<Locale, MarketingContent> = { en, es };

export function getMarketing(locale: Locale): MarketingContent {
  return marketingByLocale[locale];
}
