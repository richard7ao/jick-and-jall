import { notFound } from "next/navigation";
import { isLocale } from "../../../../../lib/i18n";
import { AppShell } from "../../../../../components/app-shell/app-shell";
import { ProfileEditor } from "../../../../../components/creator-profile/profile-editor";

export default async function CreatorProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <AppShell role="creator" locale={locale}>
      <h1>{locale === "es" ? "Perfil" : "Profile"}</h1>
      <ProfileEditor locale={locale} initial={{ displayName: "", bio: "", published: false, available: true }} />
    </AppShell>
  );
}
