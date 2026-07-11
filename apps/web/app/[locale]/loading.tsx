export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-bg"
    >
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
