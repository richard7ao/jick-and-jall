"use client";

import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { title: "Your recordings", empty: "No recordings yet.", play: "Play", delete: "Delete", export: "Export my data" },
  es: { title: "Tus grabaciones", empty: "Aún no hay grabaciones.", play: "Reproducir", delete: "Eliminar", export: "Exportar mis datos" },
};

export type RecordingItem = { id: string; createdAt: string };

export function RecordingsList({
  locale,
  recordings,
  onPlay,
  onDelete,
  onExport,
}: {
  locale: Locale;
  recordings: RecordingItem[];
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}) {
  const t = STRINGS[locale];
  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{t.title}</h2>
        <Button type="button" variant="ghost" onClick={onExport}>
          {t.export}
        </Button>
      </div>
      {recordings.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>{t.empty}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
          {recordings.map((rec) => (
            <li key={rec.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ flex: 1 }}>{rec.createdAt}</span>
              <Button type="button" variant="ghost" onClick={() => onPlay(rec.id)}>
                {t.play}
              </Button>
              <Button type="button" variant="accent" onClick={() => onDelete(rec.id)} aria-label={`${t.delete} ${rec.id}`}>
                {t.delete}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
