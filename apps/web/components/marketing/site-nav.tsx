"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Dictionary, Locale } from "../../lib/i18n";
import { LangToggle } from "./lang-toggle";
import { DemoButton } from "./demo-button";

export function SiteNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.marketing.nav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `#how`, label: t.howItWorks },
    { href: `#creators`, label: t.creators },
    { href: `#brands`, label: t.brands },
    { href: `#faq`, label: t.faq },
  ];

  return (
    <header className="site-nav" data-scrolled={scrolled}>
      <nav className="container nav-inner" aria-label="Primary">
        <Link href={`/${locale}` as Route} className="nav-brand" onClick={() => setOpen(false)}>
          <span className="brand-dot" aria-hidden="true" />
          Jick &amp; Jall
        </Link>

        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <LangToggle locale={locale} />
          <div className="nav-cta-group">
            <Link href={`/${locale}/sign-in` as Route} className="nav-link">
              {t.signIn}
            </Link>
            <DemoButton
              locale={locale}
              label={t.demo}
              loadingLabel={t.demoLoading}
              className="btn btn-ghost btn-sm"
            />
            <Link href={`/${locale}/register` as Route} className="btn btn-primary btn-sm">
              {t.getStarted}
            </Link>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? t.closeMenu : t.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-mobile" id="nav-mobile">
          <div className="container nav-mobile-inner">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="nav-link" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="nav-mobile-actions">
              <Link href={`/${locale}/sign-in` as Route} className="btn btn-ghost" onClick={() => setOpen(false)}>
                {t.signIn}
              </Link>
              <DemoButton
                locale={locale}
                label={t.demo}
                loadingLabel={t.demoLoading}
                className="btn btn-ghost"
              />
              <Link href={`/${locale}/register` as Route} className="btn btn-primary" onClick={() => setOpen(false)}>
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
