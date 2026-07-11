"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { title: "Title", brief: "Brief", publish: "Publish", published: "Published", draft: "Draft" },
  es: { title: "Título", brief: "Resumen", publish: "Publicar", published: "Publicado", draft: "Borrador" },
};

export type CampaignFields = { title: string; brief: string; status: "draft" | "published" | "closed" };

export function CampaignEditor({ locale, initial }: { locale: Locale; initial: CampaignFields }) {
  const t = STRINGS[locale];
  const [fields, setFields] = useState(initial);

  return (
    <section style={{ display: "grid", gap: "1rem", maxWidth: "32rem" }}>
      <p aria-label="status" style={{ color: "var(--color-muted)", margin: 0 }}>
        {fields.status === "published" ? t.published : t.draft}
      </p>
      <label style={{ display: "grid", gap: "0.3rem" }}>
        {t.title}
        <input value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} />
      </label>
      <label style={{ display: "grid", gap: "0.3rem" }}>
        {t.brief}
        <textarea value={fields.brief} onChange={(e) => setFields({ ...fields, brief: e.target.value })} rows={4} />
      </label>
      <Button
        type="button"
        variant="primary"
        disabled={fields.status === "published"}
        onClick={() => setFields({ ...fields, status: "published" })}
      >
        {t.publish}
      </Button>
    </section>
  );
}
