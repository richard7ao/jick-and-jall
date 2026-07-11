import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { isLocale } from "@/lib/i18n";
import { getAuthCopy } from "@/lib/copy/auth";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getAuthCopy(locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black">{copy.signInTitle}</h1>
        <p className="text-muted">{copy.signInSubtitle}</p>
      </div>
      <AuthForm locale={locale} copy={copy} mode="sign-in" />
      <div className="flex flex-col gap-1 text-sm text-muted">
        <Link className="hover:text-ink" href={`/${locale}/recover`}>
          {copy.toRecover}
        </Link>
        <Link className="hover:text-ink" href={`/${locale}/register`}>
          {copy.toRegister}
        </Link>
      </div>
    </div>
  );
}
