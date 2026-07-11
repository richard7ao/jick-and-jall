"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { DealsCopy } from "@/lib/copy/deals";

export function FundButton({ dealId, copy }: { dealId: string; copy: DealsCopy }) {
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    setBusy(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/checkout`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string };
      if (body.url) {
        window.location.assign(body.url);
        return;
      }
    } catch {
      /* ignore */
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={startCheckout} disabled={busy}>
        {copy.fund}
      </Button>
      <p className="text-sm text-muted">{copy.fundingNote}</p>
    </div>
  );
}
