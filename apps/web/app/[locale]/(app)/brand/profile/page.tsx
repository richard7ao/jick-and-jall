import { notFound } from "next/navigation";

import { BrandProfileEditor } from "@/components/brand-editors/brand-profile-editor";
import { isLocale } from "@/lib/i18n";
import { getBrandEditorsCopy } from "@/lib/copy/brand-editors";

export default async function BrandProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getBrandEditorsCopy(locale);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-3xl font-black">{copy.profileTitle}</h1>
      <BrandProfileEditor locale={locale} copy={copy} />
    </div>
  );
}
