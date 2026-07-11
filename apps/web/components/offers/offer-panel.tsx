"use client";

import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { terms: "Offer terms", amount: "Creator amount", fee: "Platform fee (10%)", total: "Brand pays", accept: "Accept offer", accepted: "Accepted" },
  es: { terms: "Términos de la oferta", amount: "Monto del creador", fee: "Comisión (10%)", total: "La marca paga", accept: "Aceptar oferta", accepted: "Aceptada" },
};

function gbp(minor: number): string {
  return `£${(minor / 100).toFixed(2)}`;
}

export function OfferPanel({
  locale,
  creatorAmountMinor,
  platformFeeMinor,
  brandChargeMinor,
  accepted,
  onAccept,
}: {
  locale: Locale;
  creatorAmountMinor: number;
  platformFeeMinor: number;
  brandChargeMinor: number;
  accepted: boolean;
  onAccept: () => void;
}) {
  const t = STRINGS[locale];
  return (
    <section style={{ display: "grid", gap: "0.5rem", maxWidth: "24rem" }}>
      <h2 style={{ margin: 0 }}>{t.terms}</h2>
      <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.25rem 1rem", margin: 0 }}>
        <dt>{t.amount}</dt>
        <dd style={{ margin: 0 }}>{gbp(creatorAmountMinor)}</dd>
        <dt>{t.fee}</dt>
        <dd style={{ margin: 0 }}>{gbp(platformFeeMinor)}</dd>
        <dt style={{ fontWeight: 700 }}>{t.total}</dt>
        <dd style={{ margin: 0, fontWeight: 700 }}>{gbp(brandChargeMinor)}</dd>
      </dl>
      <Button type="button" variant="primary" disabled={accepted} onClick={onAccept}>
        {accepted ? t.accepted : t.accept}
      </Button>
    </section>
  );
}
