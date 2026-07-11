"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { name: "Display name", bio: "Bio", published: "Published", available: "Available for work", save: "Save", saved: "Saved", error: "Could not save" },
  es: { name: "Nombre visible", bio: "Biografía", published: "Publicado", available: "Disponible para trabajar", save: "Guardar", saved: "Guardado", error: "No se pudo guardar" },
};

export type ProfileFields = {
  displayName: string;
  bio: string;
  published: boolean;
  available: boolean;
};

export function ProfileEditor({ locale, initial }: { locale: Locale; initial: ProfileFields }) {
  const t = STRINGS[locale];
  const [fields, setFields] = useState<ProfileFields>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...fields, locale }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <section style={{ display: "grid", gap: "1rem", maxWidth: "32rem" }}>
      <label style={{ display: "grid", gap: "0.3rem" }}>
        {t.name}
        <input value={fields.displayName} onChange={(e) => setFields({ ...fields, displayName: e.target.value })} />
      </label>
      <label style={{ display: "grid", gap: "0.3rem" }}>
        {t.bio}
        <textarea value={fields.bio} onChange={(e) => setFields({ ...fields, bio: e.target.value })} rows={4} />
      </label>
      <label style={{ display: "flex", gap: "0.5rem" }}>
        <input type="checkbox" checked={fields.published} onChange={(e) => setFields({ ...fields, published: e.target.checked })} />
        {t.published}
      </label>
      <label style={{ display: "flex", gap: "0.5rem" }}>
        <input type="checkbox" checked={fields.available} onChange={(e) => setFields({ ...fields, available: e.target.checked })} />
        {t.available}
      </label>
      <Button type="button" onClick={save} disabled={state === "saving"}>
        {t.save}
      </Button>
      {state === "saved" && <p role="status">{t.saved}</p>}
      {state === "error" && <p role="alert">{t.error}</p>}
    </section>
  );
}
