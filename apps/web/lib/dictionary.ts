/**
 * Server-only loader for the bilingual UI copy stored in the repo-root
 * `content/<locale>.json` files (the single source of truth owned by T0.1.2).
 *
 * The dictionaries live outside apps/web, so we resolve the `content` directory
 * by walking up from the current working directory rather than importing across
 * the package boundary.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import type { Locale } from './i18n'

export interface Dictionary {
  meta: { locale: string; dir: string }
  nav: { howItWorks: string; waitlist: string; signIn: string }
  hero: { title: string; subtitle: string; creatorCta: string; brandCta: string }
  waitlistForm: {
    title: string
    roleCreator: string
    roleBrand: string
    emailLabel: string
    consent: string
    submit: string
    success: string
  }
  footer: { tagline: string; privacy: string; terms: string }
}

function findContentDir(): string {
  let dir = process.cwd()
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(dir, 'content')
    try {
      readFileSync(join(candidate, 'en.json'))
      return candidate
    } catch {
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  throw new Error('Unable to locate the repo-root content directory')
}

export function getDictionary(locale: Locale): Dictionary {
  const file = join(findContentDir(), `${locale}.json`)
  return JSON.parse(readFileSync(file, 'utf8')) as Dictionary
}
