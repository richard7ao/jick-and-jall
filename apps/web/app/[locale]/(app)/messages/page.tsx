"use client";

import { use, useState } from "react";
import { ChatThread, type ChatMessage } from "../../../../components/chat/chat-thread";
import { isLocale, type Locale } from "../../../../lib/i18n";

export default function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc: Locale = isLocale(locale) ? locale : "en";
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function send(body: string) {
    setMessages((prev) => [...prev, { id: `local-${prev.length}`, senderUid: "me", body }]);
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem", maxWidth: "40rem" }}>
      <h1>{loc === "es" ? "Mensajes" : "Messages"}</h1>
      <ChatThread locale={loc} currentUid="me" messages={messages} onSend={send} />
    </div>
  );
}
