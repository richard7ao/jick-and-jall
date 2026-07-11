"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { Locale } from "../../lib/i18n";

/**
 * "Go to demo" — spins up a short loading state, then routes into the live
 * product dashboard. The spinner gives immediate feedback while the app route
 * is prefetched and navigated to.
 */
export function DemoButton({
  locale,
  label,
  loadingLabel,
  role = "creator",
  className = "btn btn-primary",
}: {
  locale: Locale;
  label: string;
  loadingLabel: string;
  role?: "creator" | "brand";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  const target = `/${locale}/${role}` as Route;

  const onClick = () => {
    if (spinning || pending) return;
    setSpinning(true);
    router.prefetch(target);
    // Brief, deliberate spin-up before handing off to the app.
    window.setTimeout(() => {
      startTransition(() => router.push(target));
    }, 900);
  };

  const busy = spinning || pending;

  return (
    <button type="button" className={className} onClick={onClick} disabled={busy} aria-busy={busy}>
      {busy ? (
        <>
          <span className="spinner" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}
    </button>
  );
}
