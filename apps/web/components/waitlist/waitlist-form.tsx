"use client";

import { CONSENT_POLICY_VERSION, type Role } from "@jj/shared";
import { useState } from "react";
import type { Dictionary, Locale } from "../../lib/i18n";
import { Button } from "../ui/button";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm({
  locale,
  dict,
  initialRole = "creator",
}: {
  locale: Locale;
  dict: Dictionary;
  initialRole?: Role;
}) {
  const t = dict.waitlistForm;
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          email,
          locale,
          consent: { accepted: true, policyVersion: CONSENT_POLICY_VERSION },
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" aria-live="polite" style={{ color: "var(--color-ink)", fontWeight: 600 }}>
        {t.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "1rem", maxWidth: "28rem" }}>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", gap: "1rem" }}>
        <legend style={{ fontWeight: 600 }}>{t.title}</legend>
        {(["creator", "brand"] as const).map((r) => (
          <label key={r} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
            {r === "creator" ? t.roleCreator : t.roleBrand}
          </label>
        ))}
      </fieldset>

      <label style={{ display: "grid", gap: "0.35rem" }}>
        {t.emailLabel}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--color-border)" }}
        />
      </label>

      <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t.consent}</span>
      </label>

      {status === "error" && (
        <p role="alert" style={{ color: "var(--color-accent)", margin: 0 }}>
          {t.consent}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={status === "submitting"}>
        {t.submit}
      </Button>
    </form>
  );
}
