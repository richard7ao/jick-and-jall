"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import type { MatchesCopy } from "@/lib/copy/matches";

interface Opportunity {
  id: string;
  brandName: string;
  fitReason: string;
  decision?: "accepted" | "declined";
}

export function OpportunityList({ copy }: { copy: MatchesCopy }) {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/matches?role=creator")
      .then((r) => (r.ok ? (r.json() as Promise<Opportunity[]>) : []))
      .then((d) => active && setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  async function decide(id: string, decision: "accepted" | "declined") {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, decision } : it)));
    await fetch(`/api/matches/${id}/consent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision }),
    }).catch(() => {});
  }

  if (loaded && items.length === 0) {
    return <p className="text-muted">{copy.empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((it) => (
        <li key={it.id} className="flex flex-col gap-3 rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold">{it.brandName}</span>
            <Pill side="jall">Brand</Pill>
          </div>
          <p className="text-sm font-semibold text-muted">{copy.fitReason}</p>
          <p>{it.fitReason}</p>
          {it.decision ? (
            <p role="status" className="text-sm text-muted">
              {it.decision === "accepted" ? copy.contactRevealed : copy.declined}
            </p>
          ) : (
            <div className="flex gap-3">
              <Button onClick={() => decide(it.id, "accepted")}>{copy.accept}</Button>
              <Button variant="ghost" onClick={() => decide(it.id, "declined")}>
                {copy.decline}
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
