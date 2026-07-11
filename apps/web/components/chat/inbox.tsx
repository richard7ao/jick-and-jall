"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { ChatCopy } from "@/lib/copy/chat";
import type { Locale } from "@/lib/i18n";

interface Conversation {
  id: string;
  withName: string;
  preview: string;
}

export function Inbox({ locale, copy }: { locale: Locale; copy: ChatCopy }) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/conversations")
      .then((r) => (r.ok ? (r.json() as Promise<Conversation[]>) : []))
      .then((d) => active && setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  if (loaded && items.length === 0) {
    return <p className="text-muted">{copy.inboxEmpty}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={`/${locale}/conversations/${c.id}`}
            className="flex flex-col gap-1 py-4 hover:opacity-80"
          >
            <span className="font-display font-bold">{c.withName}</span>
            <span className="truncate text-sm text-muted">{c.preview}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
