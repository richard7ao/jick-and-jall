import Link from "next/link";

import { defaultLocale } from "@/lib/i18n";

export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale}>
      <body className="min-h-dvh bg-bg text-ink">
        <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6">
          <p className="font-display text-5xl font-black text-primary">404</p>
          <h1 className="font-display text-3xl font-extrabold">Page not found</h1>
          <p className="text-muted">The page you are looking for does not exist or has moved.</p>
          <Link
            href={`/${defaultLocale}`}
            className="rounded-full border-2 border-border px-6 py-3 font-display font-bold tracking-wide text-ink transition-colors hover:border-ink"
          >
            Go home
          </Link>
        </main>
      </body>
    </html>
  );
}
