import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getDictionary } from '@/lib/dictionary'
import { isLocale } from '@/lib/i18n'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-6 py-20">
      <nav className="flex items-center justify-between text-sm text-muted">
        <span className="font-display text-base font-extrabold tracking-[-0.02em] text-ink">
          Jick &amp; Jall
        </span>
        <div className="flex gap-6">
          <span>{t.nav.howItWorks}</span>
          <span>{t.nav.signIn}</span>
        </div>
      </nav>

      <section className="flex flex-col gap-6">
        <h1
          data-testid="hero-title"
          className="font-display text-5xl font-black leading-[1.05]"
        >
          {t.hero.title}
        </h1>
        <p className="max-w-[60ch] text-lg text-muted">{t.hero.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/waitlist`}
            className="rounded-full bg-primary px-6 py-3 font-display font-bold tracking-wide text-on-primary transition-opacity hover:opacity-90"
          >
            {t.hero.creatorCta}
          </Link>
          <Link
            href={`/${locale}/waitlist`}
            className="rounded-full bg-accent px-6 py-3 font-display font-bold tracking-wide text-on-accent transition-opacity hover:opacity-90"
          >
            {t.hero.brandCta}
          </Link>
        </div>
      </section>

      <footer className="border-t border-border pt-6 text-sm text-muted">
        {t.footer.tagline}
      </footer>
    </main>
  )
}
