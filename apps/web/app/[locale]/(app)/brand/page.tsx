import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { isLocale } from "@/lib/i18n";
import { getAppShellCopy } from "@/lib/copy/app-shell";

export default async function BrandHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getAppShellCopy(locale).brand;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black">{copy.home.title}</h1>
        <p className="text-muted">{copy.home.subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/${locale}/brand/onboarding`} variant="accent">
          {copy.nav[1]!.label}
        </ButtonLink>
        <Link
          href={`/${locale}/brand/matches`}
          className="rounded-full border-2 border-border px-6 py-3 font-display font-bold hover:border-ink"
        >
          {copy.nav[3]!.label}
        </Link>
      </div>
    </div>
  );
}
