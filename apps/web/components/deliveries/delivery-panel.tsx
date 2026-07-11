"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import type { DealsCopy } from "@/lib/copy/deals";
import { canTransition, type DealStatus } from "@/lib/deal-state";

export function DeliveryPanel({
  dealId,
  copy,
  role,
  status,
}: {
  dealId: string;
  copy: DealsCopy;
  role: "creator" | "brand";
  status: DealStatus;
}) {
  const [note, setNote] = useState("");
  const [current, setCurrent] = useState<DealStatus>(status);

  async function act(to: DealStatus, path: string) {
    setCurrent(to);
    await fetch(`/api/deals/${dealId}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    }).catch(() => {});
  }

  const canDeliver =
    role === "creator" && (canTransition(current, "delivered") || current === "revision_requested");
  const canReview = role === "brand" && current === "delivered";

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border p-6">
      <h2 className="font-display text-xl font-bold">{copy.deliveryTitle}</h2>
      <p className="text-sm text-muted" data-testid="deal-status">
        {copy.status[current]}
      </p>

      {canDeliver ? (
        <>
          <TextArea
            aria-label={copy.submitDelivery}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button className="self-start" onClick={() => act("delivered", "deliver")}>
            {copy.submitDelivery}
          </Button>
        </>
      ) : null}

      {canReview ? (
        <div className="flex gap-3">
          <Button onClick={() => act("approved", "approve")}>{copy.approve}</Button>
          <Button variant="ghost" onClick={() => act("revision_requested", "revise")}>
            {copy.requestRevision}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
