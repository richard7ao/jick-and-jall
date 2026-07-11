import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "ghost";

const STYLES: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--color-primary)", color: "var(--color-on-primary)" },
  accent: { background: "var(--color-accent)", color: "var(--color-on-accent)" },
  ghost: { background: "transparent", color: "var(--color-ink)", border: "1px solid var(--color-border)" },
};

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius)",
  border: 0,
  fontWeight: 700,
  fontFamily: "var(--font-body)",
  cursor: "pointer",
  textDecoration: "none",
};

export function Button({
  variant = "primary",
  children,
  ...props
}: { variant?: Variant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button style={{ ...base, ...STYLES[variant] }} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  children,
  ...props
}: { variant?: Variant; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a style={{ ...base, ...STYLES[variant] }} {...props}>
      {children}
    </a>
  );
}
