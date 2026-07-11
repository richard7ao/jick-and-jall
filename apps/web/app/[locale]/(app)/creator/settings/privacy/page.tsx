import { notFound } from "next/navigation";

import { PrivacyControls } from "@/components/creator-profile/privacy-controls";
import { isLocale } from "@/lib/i18n";
import { getCreatorProfileCopy } from "@/lib/copy/creator-profile";

export default async function CreatorPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCreatorProfileCopy(locale);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-3xl font-black">{copy.privacyTitle}</h1>
      <p className="text-muted">{copy.retentionNote}</p>
      <PrivacyControls copy={copy} />
    </div>
  );
}
