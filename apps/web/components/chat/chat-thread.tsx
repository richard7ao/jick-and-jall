"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { placeholder: "Write a message", send: "Send", empty: "No messages yet." },
  es: { placeholder: "Escribe un mensaje", send: "Enviar", empty: "Aún no hay mensajes." },
};

export type ChatMessage = { id: string; senderUid: string; body: string };

export function ChatThread({
  locale,
  currentUid,
  messages,
  onSend,
}: {
  locale: Locale;
  currentUid: string;
  messages: ChatMessage[];
  onSend: (body: string) => void;
}) {
  const t = STRINGS[locale];
  const [draft, setDraft] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft("");
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <ul aria-label="messages" style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
        {messages.length === 0 && <li style={{ color: "var(--color-muted)" }}>{t.empty}</li>}
        {messages.map((m) => (
          <li
            key={m.id}
            data-own={m.senderUid === currentUid}
            style={{ justifySelf: m.senderUid === currentUid ? "end" : "start", maxWidth: "80%" }}
          >
            {m.body}
          </li>
        ))}
      </ul>
      <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          aria-label={t.placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t.placeholder}
          style={{ flex: 1, padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)" }}
        />
        <Button type="submit" variant="primary">
          {t.send}
        </Button>
      </form>
    </div>
  );
}
