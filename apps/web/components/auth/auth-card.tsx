import type { ReactNode } from "react";
import type { Locale } from "../../lib/i18n";
import { AUTH_STRINGS } from "./auth-strings";
import { Button } from "../ui/button";

/**
 * Presentational auth card shell shared by sign-in and register. There is no
 * role switcher: a person wanting both roles creates two accounts.
 */
export function AuthCard({
  locale,
  mode,
  children,
}: {
  locale: Locale;
  mode: "sign-in" | "register";
  children?: ReactNode;
}) {
  const t = AUTH_STRINGS[locale];
  return (
    <section
      aria-labelledby="auth-title"
      style={{
        maxWidth: "24rem",
        marginInline: "auto",
        display: "grid",
        gap: "1rem",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
      }}
    >
      <h1 id="auth-title" style={{ margin: 0 }}>
        {mode === "sign-in" ? t.signInTitle : t.registerTitle}
      </h1>
      <Button variant="ghost" type="button">
        {t.continueGoogle}
      </Button>
      {children}
      <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", margin: 0 }}>{t.noSwitcher}</p>
    </section>
  );
}
