"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { DealsCopy } from "@/lib/copy/deals";

export function PayoutSetup({ copy }: { copy: DealsCopy }) {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/payouts/status")
      .then((r) =>
        r.ok ? (r.json() as Promise<{ ready?: boolean }>) : ({} as { ready?: boolean }),
      )
      .then((d) => active && setReady(Boolean(d.ready)))
      .catch(() => active && setReady(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="text-muted">
        {ready ? copy.connectReady : copy.connectPending}
      </p>
      {!ready ? (
        <Button
          onClick={() =>
            fetch("/api/payouts/onboard", { method: "POST" })
              .then((r) => r.json() as Promise<{ url?: string }>)
              .then((d) => d.url && window.location.assign(d.url))
              .catch(() => {})
          }
        >
          {copy.connect}
        </Button>
      ) : null}
    </div>
  );
}
