"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: { fund: "Fund deal (test mode)", funding: "Redirecting…", error: "Could not start checkout" },
  es: { fund: "Financiar acuerdo (modo prueba)", funding: "Redirigiendo…", error: "No se pudo iniciar el pago" },
};

/** Starts a test-mode Stripe Checkout for a deal. */
export function FundButton({ locale, dealId }: { locale: Locale; dealId: string }) {
  const t = STRINGS[locale];
  const [state, setState] = useState<"idle" | "funding" | "error">("idle");

  async function fund() {
    setState("funding");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const data = (await res.json()) as { url?: string };
      if (res.ok && data.url) window.location.assign(data.url);
      else setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Button type="button" variant="accent" onClick={fund} disabled={state === "funding"}>
        {state === "funding" ? t.funding : t.fund}
      </Button>
      {state === "error" && <p role="alert">{t.error}</p>}
    </div>
  );
}
