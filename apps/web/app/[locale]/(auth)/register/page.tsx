import { notFound } from "next/navigation";
import { isLocale } from "../../../../lib/i18n";
import { AuthCard } from "../../../../components/auth/auth-card";
import { AUTH_STRINGS } from "../../../../components/auth/auth-strings";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invitation?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { invitation } = await searchParams;
  const t = AUTH_STRINGS[locale];
  return (
    <AuthCard locale={locale} mode="register">
      <form style={{ display: "grid", gap: "0.75rem" }}>
        <input type="hidden" name="invitation" value={invitation ?? ""} />
        <label style={{ display: "grid", gap: "0.3rem" }}>
          {t.email}
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label style={{ display: "grid", gap: "0.3rem" }}>
          {t.password}
          <input type="password" name="password" autoComplete="new-password" required />
        </label>
        <button type="submit">{t.submitRegister}</button>
      </form>
    </AuthCard>
  );
}
