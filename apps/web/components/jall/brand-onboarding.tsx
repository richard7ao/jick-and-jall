"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { prompt: "Describe your campaign", budget: "Budget (GBP)", create: "Create draft", created: "Draft created" },
  es: { prompt: "Describe tu campaña", budget: "Presupuesto (GBP)", create: "Crear borrador", created: "Borrador creado" },
};

/** Jall brand intake: describe a campaign and create a draft. */
export function BrandOnboarding({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [created, setCreated] = useState(false);

  const budgetMinor = Math.round(Number(budget) * 100);
  const valid = brief.trim().length > 0 && Number.isFinite(budgetMinor) && budgetMinor > 0;

  return (
    <section style={{ display: "grid", gap: "1rem", maxWidth: "36rem" }}>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        {t.prompt}
        <textarea aria-label={t.prompt} value={brief} onChange={(e) => setBrief(e.target.value)} rows={5} />
      </label>
      <label style={{ display: "grid", gap: "0.35rem" }}>
        {t.budget}
        <input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} />
      </label>
      {created ? (
        <p role="status">{t.created}</p>
      ) : (
        <Button type="button" variant="accent" disabled={!valid} onClick={() => setCreated(true)}>
          {t.create}
        </Button>
      )}
    </section>
  );
}
