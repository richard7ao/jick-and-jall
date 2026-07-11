"use client";

import type { Role } from "@jj/shared";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { match: "Match", score: "Score", message: "Message", consent: "Share my details", consented: "Shared", empty: "No matches yet." },
  es: { match: "Coincidencia", score: "Puntuación", message: "Mensaje", consent: "Compartir mis datos", consented: "Compartido", empty: "Aún no hay coincidencias." },
};

export type MatchRow = { id: string; label: string; score: number; disclosureConsented: boolean };

/**
 * Role-aware match list. Brands can message a consented match; creators consent
 * to disclosure before their details are shared.
 */
export function MatchList({
  locale,
  role,
  matches,
  onConsent,
  onMessage,
}: {
  locale: Locale;
  role: Role;
  matches: MatchRow[];
  onConsent: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  const t = STRINGS[locale];
  if (matches.length === 0) return <p style={{ color: "var(--color-muted)" }}>{t.empty}</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
      {matches.map((m) => (
        <li key={m.id} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ flex: 1 }}>{m.label}</span>
          <span aria-label={t.score}>{Math.round(m.score * 100)}%</span>
          {role === "creator" ? (
            <Button
              type="button"
              variant={m.disclosureConsented ? "ghost" : "primary"}
              disabled={m.disclosureConsented}
              onClick={() => onConsent(m.id)}
            >
              {m.disclosureConsented ? t.consented : t.consent}
            </Button>
          ) : (
            <Button type="button" variant="accent" disabled={!m.disclosureConsented} onClick={() => onMessage(m.id)}>
              {t.message}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
