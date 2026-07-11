"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import type { ChatCopy } from "@/lib/copy/chat";

type Delivery = "sending" | "sent" | "failed";

interface Message {
  id: string;
  mine: boolean;
  body: string;
  delivery?: Delivery;
}

function renderBody(body: string) {
  return body.split(/(\s+)/).map((token, i) =>
    /^https?:\/\//.test(token) ? (
      <a key={i} href={token} className="underline" rel="noreferrer noopener" target="_blank">
        {token}
      </a>
    ) : (
      token
    ),
  );
}

export function ChatThread({ conversationId, copy }: { conversationId: string; copy: ChatCopy }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    let active = true;
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => {
        if (!r.ok) throw new Error("load");
        return r.json() as Promise<Message[]>;
      })
      .then((d) => active && setMessages(Array.isArray(d) ? d : []))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [conversationId]);

  async function send() {
    const body = draft.trim();
    if (!body) return;
    const id = `local-${seq.current++}`;
    setDraft("");
    setMessages((prev) => [...prev, { id, mine: true, body, delivery: "sending" }]);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, delivery: res.ok ? "sent" : "failed" } : m)),
      );
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, delivery: "failed" } : m)));
    }
  }

  if (error) {
    return (
      <p role="alert" className="text-accent">
        {copy.loadError}
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ul className="flex flex-1 flex-col gap-3" data-testid="messages">
        {messages.length === 0 ? (
          <li className="text-muted">{copy.threadEmpty}</li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                m.mine ? "self-end bg-primary/15" : "self-start bg-surface"
              }`}
            >
              <p>{renderBody(m.body)}</p>
              {m.mine && m.delivery ? (
                <span className="text-xs text-muted">
                  {m.delivery === "sending"
                    ? copy.sending
                    : m.delivery === "failed"
                      ? copy.failed
                      : ""}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex gap-2"
      >
        <TextInput
          aria-label={copy.placeholder}
          placeholder={copy.placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">{copy.send}</Button>
      </form>
    </div>
  );
}
