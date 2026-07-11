/**
 * Deterministic waitlist form validation and bilingual microcopy.
 *
 * Validation is plain TypeScript (never model-driven): the only required inputs
 * are role, a well-formed email, and explicit consent. Everything else is
 * optional, matching the v1 low-friction capture contract.
 */

import type { Locale } from "./i18n";

export type WaitlistRole = "creator" | "brand";

export interface WaitlistInput {
  role: WaitlistRole | null;
  email: string;
  consent: boolean;
}

export type WaitlistField = "role" | "email" | "consent";
export type WaitlistErrors = Partial<Record<WaitlistField, string>>;

export interface WaitlistCopy {
  heading: string;
  subheading: string;
  optionalLabel: string;
  handleLabel: string;
  handlePlaceholder: string;
  submitting: string;
  errorGeneric: string;
  errors: Record<WaitlistField, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isWaitlistRole(value: string): value is WaitlistRole {
  return value === "creator" || value === "brand";
}

export function validateWaitlist(
  input: WaitlistInput,
  messages: Record<WaitlistField, string>,
): WaitlistErrors {
  const errors: WaitlistErrors = {};
  if (input.role === null) errors.role = messages.role;
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = messages.email;
  if (!input.consent) errors.consent = messages.consent;
  return errors;
}

const copy: Record<Locale, WaitlistCopy> = {
  en: {
    heading: "Join the waitlist",
    subheading: "Tell us who you are and how to reach you. Everything else is optional.",
    optionalLabel: "Optional",
    handleLabel: "Website or social handle",
    handlePlaceholder: "@yourhandle or https://…",
    submitting: "Sending…",
    errorGeneric: "Something went wrong. Please try again.",
    errors: {
      role: "Please choose creator or brand.",
      email: "Enter a valid email address.",
      consent: "Please agree to be contacted.",
    },
  },
  es: {
    heading: "Únete a la lista de espera",
    subheading: "Dinos quién eres y cómo contactarte. Todo lo demás es opcional.",
    optionalLabel: "Opcional",
    handleLabel: "Sitio web o usuario en redes",
    handlePlaceholder: "@tuusuario o https://…",
    submitting: "Enviando…",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errors: {
      role: "Elige creador o marca.",
      email: "Introduce un correo electrónico válido.",
      consent: "Acepta que te contactemos.",
    },
  },
};

export function getWaitlistCopy(locale: Locale): WaitlistCopy {
  return copy[locale];
}
