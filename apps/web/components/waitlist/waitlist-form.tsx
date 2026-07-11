"use client";

import { CONSENT_POLICY_VERSION, type Role } from "@jj/shared";
import { useState } from "react";
import type { Dictionary, Locale } from "../../lib/i18n";

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
      <div className="card" style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
        <span className="pill pill-jick">✓</span>
        <p role="status" aria-live="polite" style={{ color: "var(--color-ink)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
          {t.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card" style={{ display: "grid", gap: "1.25rem" }}>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: "0.6rem" }}>
        <legend style={{ fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: "0.4rem" }}>
          {t.title}
        </legend>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["creator", "brand"] as const).map((r) => (
            <label
              key={r}
              className={`btn ${role === r ? (r === "creator" ? "btn-primary" : "btn-accent") : "btn-ghost"}`}
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              {r === "creator" ? t.roleCreator : t.roleBrand}
            </label>
          ))}
        </div>
      </fieldset>

      <label style={{ display: "grid", gap: "0.4rem", fontWeight: 600 }}>
        {t.emailLabel}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
        />
      </label>

      <label style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", color: "var(--color-muted)" }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: "0.2rem", width: "1.1rem", height: "1.1rem", accentColor: "var(--color-accent)" }}
        />
        <span>{t.consent}</span>
      </label>

      {status === "error" && (
        <p role="alert" style={{ color: "var(--color-accent)", margin: 0, fontWeight: 600 }}>
          {t.consent}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === "submitting"}>
        {status === "submitting" ? <span className="spinner" aria-hidden="true" /> : null}
        {t.submit}
      </button>
    </form>
  );
}
