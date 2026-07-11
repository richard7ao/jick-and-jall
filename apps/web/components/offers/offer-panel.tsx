"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { parseBudgetGbp } from "@/lib/copy/brand-editors";
import type { DealsCopy } from "@/lib/copy/deals";
import { brandChargeMinor, formatGbp, platformFeeMinor } from "@/lib/deal-state";

interface OfferVersion {
  version: number;
  creatorMinor: number;
  deliverable: string;
}

export function OfferPanel({
  dealId,
  copy,
  role,
  initialOffers = [],
}: {
  dealId: string;
  copy: DealsCopy;
  role: "creator" | "brand";
  initialOffers?: OfferVersion[];
}) {
  const [offers, setOffers] = useState<OfferVersion[]>(initialOffers);
  const [amount, setAmount] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [error, setError] = useState<string | undefined>();

  const minor = parseBudgetGbp(amount);

  async function sendOffer() {
    if (minor === null) {
      setError(copy.amountError);
      return;
    }
    setError(undefined);
    const version = (offers.at(-1)?.version ?? 0) + 1;
    const next: OfferVersion = { version, creatorMinor: minor, deliverable };
    setOffers((prev) => [...prev, next]);
    await fetch(`/api/deals/${dealId}/offers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border p-6">
      <h2 className="font-display text-xl font-bold">{copy.offerTitle}</h2>

      {role === "brand" ? (
        <>
          <Field label={copy.amountLabel} id="offer-amount" hint={copy.amountHint} error={error}>
            <TextInput
              id="offer-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label={copy.deliverableLabel} id="offer-deliverable">
            <TextArea
              id="offer-deliverable"
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
            />
          </Field>
          {minor !== null ? (
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{copy.serviceFee}</dt>
                <dd>{formatGbp(platformFeeMinor(minor))}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>{copy.youPay}</dt>
                <dd data-testid="brand-charge">{formatGbp(brandChargeMinor(minor))}</dd>
              </div>
            </dl>
          ) : null}
          <Button onClick={sendOffer} className="self-start">
            {copy.sendOffer}
          </Button>
        </>
      ) : null}

      {offers.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-display font-bold">{copy.offerHistory}</h3>
          <ol className="flex flex-col gap-2" data-testid="offer-history">
            {offers.map((o) => (
              <li
                key={o.version}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
              >
                <span>
                  v{o.version} · {o.deliverable || "—"}
                </span>
                <span className="font-bold">{formatGbp(o.creatorMinor)}</span>
              </li>
            ))}
          </ol>
          {role === "creator" ? (
            <Button
              className="self-start"
              onClick={() =>
                fetch(`/api/deals/${dealId}/accept`, { method: "POST" }).catch(() => {})
              }
            >
              {copy.accept}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
