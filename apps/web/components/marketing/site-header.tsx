import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function SiteHeader({ locale, nav }: { locale: Locale; nav: Dictionary["nav"] }) {
  return (
    <header className="sticky top-0 z-[200] border-b border-border/60 bg-bg/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href={`/${locale}`}
          className="font-display text-lg font-extrabold tracking-[-0.02em] text-ink"
        >
          Jick <span className="text-primary">&amp;</span> Jall
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a className="hidden hover:text-ink sm:inline" href={`/${locale}#how`}>
            {nav.howItWorks}
          </a>
          <Link className="hover:text-ink" href={`/${locale}/sign-in`}>
            {nav.signIn}
          </Link>
          <ButtonLink href={`/${locale}/waitlist`} className="px-4 py-2 text-sm">
            {nav.waitlist}
          </ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
