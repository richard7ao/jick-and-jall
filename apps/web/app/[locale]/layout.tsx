import '../globals.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

import { locales } from '@/lib/i18n'

export const dynamicParams = false

export function generateStaticParams(): Array<{ locale: string }> {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Jick & Jall',
  description: 'Creators and brands, matched by voice.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  // `dynamicParams = false` + `generateStaticParams` already 404s any locale
  // outside `locales`, so no runtime guard is needed here.
  const { locale } = await params

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-bg text-ink">{children}</body>
    </html>
  )
}
