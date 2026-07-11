"use client";

import { use } from "react";
import { MatchList } from "../../../../../components/matches/match-list";
import { isLocale, type Locale } from "../../../../../lib/i18n";

export default function CreatorOpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc: Locale = isLocale(locale) ? locale : "en";
  async function consent(id: string) {
    await fetch("/api/matches", { method: "POST", body: JSON.stringify({ matchId: id }) });
  }
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <h1>{loc === "es" ? "Oportunidades" : "Opportunities"}</h1>
      <MatchList locale={loc} role="creator" matches={[]} onConsent={consent} onMessage={() => {}} />
    </div>
  );
}
