import Link from "next/link";

import { Container } from "@/components/ui/container";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function SiteFooter({ locale, footer }: { locale: Locale; footer: Dictionary["footer"] }) {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-start justify-between gap-4 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          <span className="font-display font-bold text-ink">Jick &amp; Jall</span>
          {" — "}
          {footer.tagline}
        </p>
        <nav className="flex gap-6">
          <Link className="hover:text-ink" href={`/${locale}/privacy`}>
            {footer.privacy}
          </Link>
          <Link className="hover:text-ink" href={`/${locale}/terms`}>
            {footer.terms}
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
