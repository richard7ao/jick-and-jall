"use client";

import { use } from "react";
import { RecordingsList } from "../../../../../../components/recordings/recordings-list";
import { isLocale, type Locale } from "../../../../../../lib/i18n";

export default function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc: Locale = isLocale(locale) ? locale : "en";

  async function del(id: string) {
    await fetch(`/api/media?path=recordings/self/${id}`, { method: "DELETE" });
  }
  async function play(id: string) {
    await fetch(`/api/media?path=recordings/self/${id}`);
  }
  async function exportData() {
    await fetch("/api/account/export");
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <h1>{loc === "es" ? "Privacidad" : "Privacy"}</h1>
      <RecordingsList locale={loc} recordings={[]} onPlay={play} onDelete={del} onExport={exportData} />
    </div>
  );
}
