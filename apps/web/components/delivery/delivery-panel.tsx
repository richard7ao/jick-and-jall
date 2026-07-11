"use client";

import type { DealStatus } from "@jj/shared";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { deliver: "Mark delivered", approve: "Approve", revision: "Request revision", status: "Status" },
  es: { deliver: "Marcar entregado", approve: "Aprobar", revision: "Pedir revisión", status: "Estado" },
};

/** Status-aware delivery actions. Only actions legal for the current status show. */
export function DeliveryPanel({
  locale,
  status,
  onAction,
}: {
  locale: Locale;
  status: DealStatus;
  onAction: (action: "deliver" | "approve" | "requestRevision") => void;
}) {
  const t = STRINGS[locale];
  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      <p aria-label={t.status}>{status}</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {status === "funded" && (
          <Button type="button" variant="primary" onClick={() => onAction("deliver")}>
            {t.deliver}
          </Button>
        )}
        {status === "delivered" && (
          <>
            <Button type="button" variant="primary" onClick={() => onAction("approve")}>
              {t.approve}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onAction("requestRevision")}>
              {t.revision}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
