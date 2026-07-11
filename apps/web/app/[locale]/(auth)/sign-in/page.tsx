import { notFound } from "next/navigation";
import { isLocale } from "../../../../lib/i18n";
import { AuthCard } from "../../../../components/auth/auth-card";
import { AUTH_STRINGS } from "../../../../components/auth/auth-strings";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = AUTH_STRINGS[locale];
  return (
    <AuthCard locale={locale} mode="sign-in">
      <form style={{ display: "grid", gap: "0.75rem" }}>
        <label style={{ display: "grid", gap: "0.3rem" }}>
          {t.email}
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label style={{ display: "grid", gap: "0.3rem" }}>
          {t.password}
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        <button type="submit">{t.submitSignIn}</button>
      </form>
    </AuthCard>
  );
}
