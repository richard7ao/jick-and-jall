"use client";

import { useEffect, useState } from "react";

import { Pill } from "@/components/ui/pill";
import type { MatchesCopy } from "@/lib/copy/matches";

interface Match {
  id: string;
  // Deliberately no numeric score and no full creator catalog is exposed here.
  alias: string;
  fitReason: string;
  status: "awaiting_consent" | "accepted";
}

export function MatchList({ copy }: { copy: MatchesCopy }) {
  const [items, setItems] = useState<Match[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/matches?role=brand")
      .then((r) => (r.ok ? (r.json() as Promise<Match[]>) : []))
      .then((d) => active && setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  if (loaded && items.length === 0) {
    return <p className="text-muted">{copy.empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((m) => (
        <li key={m.id} className="flex flex-col gap-3 rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold">{m.alias}</span>
            <Pill side="jick">Creator</Pill>
          </div>
          <p className="text-sm font-semibold text-muted">{copy.fitReason}</p>
          <p>{m.fitReason}</p>
          <p role="status" className="text-sm text-muted">
            {m.status === "accepted" ? copy.contactRevealed : copy.awaitingConsent}
          </p>
        </li>
      ))}
    </ul>
  );
}
