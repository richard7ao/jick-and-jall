import type { Locale, Role } from "@jj/shared";

/**
 * Bilingual email templates. English and Spanish must stay behaviorally
 * equivalent, so both locales are defined together and selected by key.
 */

export type EmailMessage = {
  readonly subject: string;
  readonly text: string;
};

export type InvitationVars = {
  readonly inviteUrl: string;
  readonly role: Role;
};

const ROLE_LABEL: Record<Locale, Record<Role, string>> = {
  en: { creator: "creator", brand: "brand" },
  es: { creator: "creador", brand: "marca" },
};

export function invitationEmail(locale: Locale, vars: InvitationVars): EmailMessage {
  const role = ROLE_LABEL[locale][vars.role];
  if (locale === "es") {
    return {
      subject: "Tu invitación a Jick & Jall",
      text: `Has sido invitado como ${role}. Activa tu cuenta aquí: ${vars.inviteUrl}`,
    };
  }
  return {
    subject: "Your invitation to Jick & Jall",
    text: `You've been invited as a ${role}. Activate your account here: ${vars.inviteUrl}`,
  };
}

export function waitlistConfirmationEmail(locale: Locale): EmailMessage {
  if (locale === "es") {
    return {
      subject: "Estás en la lista de espera",
      text: "Gracias por tu interés. Te avisaremos cuando tu acceso esté listo.",
    };
  }
  return {
    subject: "You're on the waitlist",
    text: "Thanks for your interest. We'll let you know when your access is ready.",
  };
}
