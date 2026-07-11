import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <h1>Page not found</h1>
      <p style={{ color: "var(--color-muted)" }}>The page you were looking for doesn’t exist.</p>
      <Link href="/en">Go home</Link>
    </div>
  );
}
