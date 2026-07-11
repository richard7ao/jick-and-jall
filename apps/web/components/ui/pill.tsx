import type { ReactNode } from "react";

const sides = {
  // Jick (creator) uses a darker amber ink so the label stays legible on the
  // pale primary tint; Jall (brand) uses the deeper accent. Mirrors DESIGN.md.
  jick: "bg-primary/12 text-[oklch(0.5_0.14_65)] ring-1 ring-primary/25",
  jall: "bg-accent/10 text-accent ring-1 ring-accent/25",
} as const;

export function Pill({ side, children }: { side: keyof typeof sides; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.08em] ${sides[side]}`}
    >
      {children}
    </span>
  );
}
