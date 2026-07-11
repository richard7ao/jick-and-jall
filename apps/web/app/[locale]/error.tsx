"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      role="alert"
      className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6"
    >
      <h1 className="font-display text-3xl font-extrabold">Something went wrong</h1>
      <p className="text-muted">An unexpected error occurred. You can try again.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary px-6 py-3 font-display font-bold tracking-wide text-on-primary transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
