import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { isLocale } from "@/lib/i18n";
import { getAppShellCopy } from "@/lib/copy/app-shell";

export default async function CreatorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getAppShellCopy(locale).creator;
  return (
    <AppShell locale={locale} role="creator" nav={copy.nav} signOut={copy.signOut}>
      {children}
    </AppShell>
  );
}
