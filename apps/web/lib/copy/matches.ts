import type { Locale } from "@/lib/i18n";

export interface MatchesCopy {
  brandTitle: string;
  brandSubtitle: string;
  creatorTitle: string;
  creatorSubtitle: string;
  empty: string;
  fitReason: string;
  accept: string;
  decline: string;
  accepted: string;
  declined: string;
  awaitingConsent: string;
  contactRevealed: string;
}

const copy: Record<Locale, MatchesCopy> = {
  en: {
    brandTitle: "Your matches",
    brandSubtitle: "Creators who fit your brief. Contact opens once they accept.",
    creatorTitle: "Opportunities for you",
    creatorSubtitle: "Briefs matched to your profile. You decide who to talk to.",
    empty: "No matches yet — check back soon.",
    fitReason: "Why this is a fit",
    accept: "Accept",
    decline: "Decline",
    accepted: "Accepted",
    declined: "Declined",
    awaitingConsent: "Waiting for the creator to accept.",
    contactRevealed: "Contact details are now available in your inbox.",
  },
  es: {
    brandTitle: "Tus coincidencias",
    brandSubtitle: "Creadores que encajan con tu brief. El contacto se abre cuando aceptan.",
    creatorTitle: "Oportunidades para ti",
    creatorSubtitle: "Briefs que encajan con tu perfil. Tú decides con quién hablar.",
    empty: "Aún no hay coincidencias — vuelve pronto.",
    fitReason: "Por qué encaja",
    accept: "Aceptar",
    decline: "Rechazar",
    accepted: "Aceptada",
    declined: "Rechazada",
    awaitingConsent: "Esperando a que el creador acepte.",
    contactRevealed: "Los datos de contacto ya están en tu bandeja de entrada.",
  },
};

export function getMatchesCopy(locale: Locale): MatchesCopy {
  return copy[locale];
}
