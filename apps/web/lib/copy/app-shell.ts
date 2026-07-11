import type { Locale } from "@/lib/i18n";
import type { WaitlistRole } from "@/lib/waitlist";

export interface NavItem {
  href: string;
  label: string;
}

export interface AppShellCopy {
  signOut: string;
  home: { title: string; subtitle: string };
  nav: NavItem[];
}

type Copy = Record<WaitlistRole, AppShellCopy>;

function creatorNav(locale: Locale, labels: string[]): NavItem[] {
  const paths = [
    "creator",
    "creator/onboarding",
    "creator/profile",
    "creator/opportunities",
    "inbox",
  ];
  return paths.map((path, i) => ({ href: `/${locale}/${path}`, label: labels[i]! }));
}

function brandNav(locale: Locale, labels: string[]): NavItem[] {
  const paths = ["brand", "brand/onboarding", "brand/campaigns", "brand/matches", "inbox"];
  return paths.map((path, i) => ({ href: `/${locale}/${path}`, label: labels[i]! }));
}

export function getAppShellCopy(locale: Locale): Copy {
  if (locale === "es") {
    return {
      creator: {
        signOut: "Cerrar sesión",
        home: {
          title: "Tu panel de creador",
          subtitle: "Completa tu perfil con Jick y revisa tus oportunidades.",
        },
        nav: creatorNav("es", ["Inicio", "Entrevista", "Perfil", "Oportunidades", "Mensajes"]),
      },
      brand: {
        signOut: "Cerrar sesión",
        home: {
          title: "Tu panel de marca",
          subtitle: "Crea tu brief con Jall y revisa tus coincidencias.",
        },
        nav: brandNav("es", ["Inicio", "Brief", "Campañas", "Coincidencias", "Mensajes"]),
      },
    };
  }
  return {
    creator: {
      signOut: "Sign out",
      home: {
        title: "Your creator dashboard",
        subtitle: "Complete your profile with Jick and review your opportunities.",
      },
      nav: creatorNav("en", ["Home", "Interview", "Profile", "Opportunities", "Inbox"]),
    },
    brand: {
      signOut: "Sign out",
      home: {
        title: "Your brand dashboard",
        subtitle: "Build your brief with Jall and review your matches.",
      },
      nav: brandNav("en", ["Home", "Brief", "Campaigns", "Matches", "Inbox"]),
    },
  };
}
