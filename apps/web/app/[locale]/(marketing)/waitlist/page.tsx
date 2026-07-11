import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Container } from "@/components/ui/container";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { getWaitlistCopy, isWaitlistRole, type WaitlistRole } from "@/lib/waitlist";

export default async function WaitlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { role } = await searchParams;
  const initialRole: WaitlistRole | null = role !== undefined && isWaitlistRole(role) ? role : null;

  const t = getDictionary(locale);
  const copy = getWaitlistCopy(locale);

  return (
    <>
      <SiteHeader locale={locale} nav={t.nav} />
      <main>
        <Container className="flex max-w-xl flex-col gap-8 py-16">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl font-black">{copy.heading}</h1>
            <p className="text-muted">{copy.subheading}</p>
          </div>
          <WaitlistForm
            locale={locale}
            form={t.waitlistForm}
            copy={copy}
            initialRole={initialRole}
          />
        </Container>
      </main>
      <SiteFooter locale={locale} footer={t.footer} />
    </>
  );
}
