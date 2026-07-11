import Link from "next/link";
import type { Route } from "next";
import type { Dictionary, Locale } from "../../lib/i18n";
import { LangToggle } from "./lang-toggle";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const m = dict.marketing;
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="nav-brand">
            <span className="brand-dot" aria-hidden="true" />
            Jick &amp; Jall
          </span>
          <p className="footer-tag">{dict.footer.tagline}</p>
        </div>
        <div className="footer-right">
          <a href="#how" className="nav-link">
            {m.nav.howItWorks}
          </a>
          <a href="#faq" className="nav-link">
            {m.nav.faq}
          </a>
          <Link href={`/${locale}/sign-in` as Route} className="nav-link">
            {m.nav.signIn}
          </Link>
          <Link href={`/${locale}/waitlist` as Route} className="btn btn-primary btn-sm">
            {m.footerCta}
          </Link>
          <LangToggle locale={locale} />
        </div>
      </div>
      <div className="container footer-copy">© {year} Jick &amp; Jall. {m.rights}</div>
    </footer>
  );
}
