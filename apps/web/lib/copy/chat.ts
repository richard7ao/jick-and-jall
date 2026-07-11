import type { Locale } from "@/lib/i18n";

export interface ChatCopy {
  inboxTitle: string;
  inboxEmpty: string;
  threadEmpty: string;
  placeholder: string;
  send: string;
  sending: string;
  failed: string;
  loadError: string;
  open: string;
}

const copy: Record<Locale, ChatCopy> = {
  en: {
    inboxTitle: "Inbox",
    inboxEmpty: "No conversations yet. They start once a match is accepted.",
    threadEmpty: "Say hello to start the conversation.",
    placeholder: "Write a message…",
    send: "Send",
    sending: "Sending…",
    failed: "Not delivered — tap to retry.",
    loadError: "We couldn't load this conversation.",
    open: "Open",
  },
  es: {
    inboxTitle: "Bandeja de entrada",
    inboxEmpty: "Aún no hay conversaciones. Empiezan cuando se acepta una coincidencia.",
    threadEmpty: "Saluda para empezar la conversación.",
    placeholder: "Escribe un mensaje…",
    send: "Enviar",
    sending: "Enviando…",
    failed: "No entregado — toca para reintentar.",
    loadError: "No pudimos cargar esta conversación.",
    open: "Abrir",
  },
};

export function getChatCopy(locale: Locale): ChatCopy {
  return copy[locale];
}
