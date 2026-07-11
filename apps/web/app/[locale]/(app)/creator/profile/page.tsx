import { notFound } from "next/navigation";

import { ProfileEditor } from "@/components/creator-profile/profile-editor";
import { RecordingList } from "@/components/recordings/recording-list";
import { isLocale } from "@/lib/i18n";
import { getCreatorProfileCopy } from "@/lib/copy/creator-profile";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCreatorProfileCopy(locale);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-black">{copy.profileTitle}</h1>
        <ProfileEditor locale={locale} copy={copy} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-extrabold">{copy.recordingsTitle}</h2>
        <RecordingList copy={copy} />
      </section>
    </div>
  );
}
