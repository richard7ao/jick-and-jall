"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";
import { useVoiceSession } from "../../hooks/use-voice-session";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { voice: "Talk to Jick", text: "Type instead", prompt: "Tell us about your content", save: "Save draft", saved: "Draft saved" },
  es: { voice: "Habla con Jick", text: "Escribir en su lugar", prompt: "Cuéntanos sobre tu contenido", save: "Guardar borrador", saved: "Borrador guardado" },
};

/**
 * Bilingual creator onboarding. Offers a voice path (Jick) and an always-
 * available equivalent text path so a voice failure never blocks completion.
 */
export function OnboardingFlow({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  const voice = useVoiceSession();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <section style={{ display: "grid", gap: "1rem", maxWidth: "36rem" }}>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Button type="button" variant="primary" onClick={voice.begin}>
          {t.voice}
        </Button>
        <Button type="button" variant="ghost" onClick={voice.fail}>
          {t.text}
        </Button>
      </div>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        {t.prompt}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          aria-label={t.prompt}
          style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)" }}
        />
      </label>

      {saved ? (
        <p role="status">{t.saved}</p>
      ) : (
        <Button type="button" variant="accent" disabled={text.trim().length === 0} onClick={() => setSaved(true)}>
          {t.save}
        </Button>
      )}
    </section>
  );
}
