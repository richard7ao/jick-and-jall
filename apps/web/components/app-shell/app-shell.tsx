import type { ReactNode } from "react";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import type { NavItem } from "@/lib/copy/app-shell";
import type { Locale } from "@/lib/i18n";
import type { WaitlistRole } from "@/lib/waitlist";

/**
 * Role home shell. Creator and brand each get their own instance — there is
 * deliberately no role switcher, since roles are immutable per account.
 */
export function AppShell({
  locale,
  role,
  nav,
  signOut,
  children,
}: {
  locale: Locale;
  role: WaitlistRole;
  nav: NavItem[];
  signOut: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="border-b border-border md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-4 md:flex-col md:items-start md:gap-6">
          <Link
            href={`/${locale}/${role}`}
            className="font-display text-lg font-extrabold tracking-[-0.02em]"
          >
            Jick <span className="text-primary">&amp;</span> Jall
          </Link>
          <Pill side={role === "creator" ? "jick" : "jall"}>
            {role === "creator" ? "Jick" : "Jall"}
          </Pill>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <a
            href={`/api/auth/sign-out?locale=${locale}`}
            className="text-sm text-muted hover:text-ink"
          >
            {signOut}
          </a>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
