import type { ReactNode } from "react";
import type { Role } from "@jj/shared";
import type { Locale } from "../../lib/i18n";

/**
 * Distinct authenticated shells for each role. There is no role switcher — the
 * navigation is fixed by the account's immutable role.
 */
type NavItem = { href: string; label: Record<Locale, string> };

const NAV: Record<Role, NavItem[]> = {
  creator: [
    { href: "creator/onboarding", label: { en: "Onboarding", es: "Incorporación" } },
    { href: "creator/profile", label: { en: "Profile", es: "Perfil" } },
    { href: "creator/opportunities", label: { en: "Opportunities", es: "Oportunidades" } },
  ],
  brand: [
    { href: "brand/onboarding", label: { en: "Onboarding", es: "Incorporación" } },
    { href: "brand/campaigns", label: { en: "Campaigns", es: "Campañas" } },
    { href: "brand/matches", label: { en: "Matches", es: "Coincidencias" } },
  ],
};

export function navItemsForRole(role: Role): NavItem[] {
  return NAV[role];
}

export function AppShell({
  role,
  locale,
  children,
}: {
  role: Role;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div data-role={role} style={{ display: "grid", gridTemplateColumns: "minmax(0, 14rem) 1fr", gap: "2rem" }}>
      <nav aria-label={role} style={{ display: "grid", gap: "0.5rem", alignContent: "start" }}>
        {NAV[role].map((item) => (
          <a key={item.href} href={`/${locale}/${item.href}`} style={{ color: "var(--color-ink)" }}>
            {item.label[locale]}
          </a>
        ))}
      </nav>
      <main>{children}</main>
    </div>
  );
}
