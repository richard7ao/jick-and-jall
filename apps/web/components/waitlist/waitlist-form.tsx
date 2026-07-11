"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { track } from "@/src/analytics/track";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import {
  validateWaitlist,
  type WaitlistCopy,
  type WaitlistErrors,
  type WaitlistRole,
} from "@/lib/waitlist";

type Status = "idle" | "submitting" | "success" | "error";

const ROLES: readonly WaitlistRole[] = ["creator", "brand"];

export function WaitlistForm({
  locale,
  form,
  copy,
  initialRole,
}: {
  locale: Locale;
  form: Dictionary["waitlistForm"];
  copy: WaitlistCopy;
  initialRole: WaitlistRole | null;
}) {
  const ids = useId();
  const emailId = `${ids}-email`;
  const handleId = `${ids}-handle`;
  const roleErrorId = `${ids}-role-error`;
  const consentErrorId = `${ids}-consent-error`;
  const [role, setRole] = useState<WaitlistRole | null>(initialRole);
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateWaitlist({ role, email, consent }, copy.errors);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          email: email.trim(),
          consent,
          locale,
          handle: handle.trim() || undefined,
        }),
      });
      if (response.ok) {
        track("waitlist_submitted", { locale, role });
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        data-testid="waitlist-success"
        className="rounded-2xl border border-border bg-surface/60 p-6 text-lg"
      >
        {form.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-display font-bold">{form.title}</legend>
        <div className="flex gap-3">
          {ROLES.map((option) => {
            const label = option === "creator" ? form.roleCreator : form.roleBrand;
            const selected = role === option;
            const optionId = `${ids}-role-${option}`;
            return (
              <label
                key={option}
                htmlFor={optionId}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-full border-2 px-6 py-3 font-display font-bold transition-colors ${
                  selected
                    ? "border-primary bg-primary/15 text-ink"
                    : "border-border text-muted hover:border-ink"
                }`}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={`${ids}-role`}
                  value={option}
                  checked={selected}
                  onChange={() => setRole(option)}
                  aria-describedby={errors.role ? roleErrorId : undefined}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
        {errors.role ? (
          <p id={roleErrorId} role="alert" className="text-sm text-accent">
            {errors.role}
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className="font-display font-bold">
          {form.emailLabel}
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className="rounded-lg border-[1.5px] border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {errors.email ? (
          <p id={`${emailId}-error`} role="alert" className="text-sm text-accent">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={handleId} className="font-display font-bold">
          {copy.handleLabel}{" "}
          <span className="font-body text-sm font-normal text-dim">({copy.optionalLabel})</span>
        </label>
        <input
          id={handleId}
          type="text"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder={copy.handlePlaceholder}
          className="rounded-lg border-[1.5px] border-border bg-bg px-4 py-3 placeholder:text-dim focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? consentErrorId : undefined}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span>{form.consent}</span>
        </label>
        {errors.consent ? (
          <p id={consentErrorId} role="alert" className="text-sm text-accent">
            {errors.consent}
          </p>
        ) : null}
      </div>

      {status === "error" ? (
        <p role="alert" className="text-sm text-accent">
          {copy.errorGeneric}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "submitting"} className="self-start">
        {status === "submitting" ? copy.submitting : form.submit}
      </Button>
    </form>
  );
}
