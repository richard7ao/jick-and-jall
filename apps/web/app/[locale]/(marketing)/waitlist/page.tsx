import { notFound } from "next/navigation";
import type { Role } from "@jj/shared";
import { getDictionary, isLocale } from "../../../../lib/i18n";
import { WaitlistForm } from "../../../../components/waitlist/waitlist-form";

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
  const dict = getDictionary(locale);
  const initialRole: Role = role === "brand" ? "brand" : "creator";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <h1 style={{ margin: 0 }}>{dict.waitlistForm.title}</h1>
      <WaitlistForm locale={locale} dict={dict} initialRole={initialRole} />
    </div>
  );
}
