"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" style={{ display: "grid", gap: "1rem" }}>
      <h1>Something went wrong.</h1>
      <p style={{ color: "var(--color-muted)" }}>
        Please try again. If the problem persists, come back a little later.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          justifySelf: "start",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: 0,
          padding: "0.6rem 1rem",
          borderRadius: "var(--radius)",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
