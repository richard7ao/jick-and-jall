"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import type { Locale } from "@/lib/i18n";
import type { AuthCopy } from "@/lib/copy/auth";
import type { WaitlistRole } from "@/lib/waitlist";

export type AuthMode = "sign-in" | "register" | "recover";

const ENDPOINTS: Record<AuthMode, string> = {
  "sign-in": "/api/auth/sign-in",
  register: "/api/auth/register",
  recover: "/api/auth/recover",
};

type Status = "idle" | "submitting" | "error" | "done";

export function AuthForm({
  locale,
  copy,
  mode,
}: {
  locale: Locale;
  copy: AuthCopy;
  mode: AuthMode;
}) {
  const ids = useId();
  const [role, setRole] = useState<WaitlistRole>("creator");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("submitting");
    try {
      const response = await fetch(ENDPOINTS[mode], {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: data.get("password") ? String(data.get("password")) : undefined,
          invitationCode: data.get("invitationCode")
            ? String(data.get("invitationCode"))
            : undefined,
          role: mode === "register" ? role : undefined,
          locale,
        }),
      });
      if (mode === "sign-in") {
        if (!response.ok) return setStatus("error");
        const body = (await response.json().catch(() => ({}))) as {
          role?: string;
        };
        const home = body.role === "brand" ? "brand" : "creator";
        window.location.assign(`/${locale}/${home}`);
        return;
      }
      // Register + recover are enumeration-safe: always report a neutral done.
      setStatus("done");
    } catch {
      setStatus(mode === "sign-in" ? "error" : "done");
    }
  }

  if (status === "done") {
    return (
      <p
        role="status"
        data-testid="auth-done"
        className="rounded-2xl border border-border bg-surface/60 p-6"
      >
        {mode === "recover" ? copy.recoverSent : copy.registered}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {mode !== "recover" ? (
        <a
          href={`/api/auth/google?locale=${locale}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border px-6 py-3 font-display font-bold hover:border-ink"
        >
          {copy.google}
        </a>
      ) : null}

      {mode === "register" ? (
        <fieldset className="flex gap-3">
          <legend className="mb-2 font-display font-bold">
            {copy.roleCreator} / {copy.roleBrand}
          </legend>
          {(["creator", "brand"] as const).map((option) => (
            <label
              key={option}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-full border-2 px-4 py-2 font-display font-bold ${
                role === option ? "border-primary bg-primary/15" : "border-border text-muted"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => setRole(option)}
                className="sr-only"
              />
              {option === "creator" ? copy.roleCreator : copy.roleBrand}
            </label>
          ))}
        </fieldset>
      ) : null}

      <Field label={copy.email} id={`${ids}-email`}>
        <TextInput id={`${ids}-email`} name="email" type="email" required />
      </Field>

      {mode === "register" ? (
        <Field label={copy.invitationCode} id={`${ids}-invite`}>
          <TextInput id={`${ids}-invite`} name="invitationCode" required />
        </Field>
      ) : null}

      {mode !== "recover" ? (
        <Field label={copy.password} id={`${ids}-password`}>
          <TextInput id={`${ids}-password`} name="password" type="password" required />
        </Field>
      ) : null}

      {status === "error" ? (
        <p role="alert" className="text-sm text-accent">
          {copy.genericError}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "submitting"}>
        {mode === "sign-in"
          ? copy.signInAction
          : mode === "register"
            ? copy.registerAction
            : copy.recoverAction}
      </Button>
    </form>
  );
}
