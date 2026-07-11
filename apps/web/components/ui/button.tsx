import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  accent: "bg-accent text-on-accent hover:opacity-90",
  ghost: "border-2 border-border bg-transparent text-ink hover:border-ink",
} as const;

export type ButtonVariant = keyof typeof variants;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-transparent px-6 py-3 font-display font-bold tracking-wide transition-[opacity,transform] duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function buttonClass(variant: ButtonVariant = "primary"): string {
  return `${base} ${variants[variant]}`;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: { variant?: ButtonVariant } & ComponentProps<typeof Link>) {
  return <Link className={`${buttonClass(variant)} ${className ?? ""}`} {...props} />;
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: { variant?: ButtonVariant } & ComponentProps<"button">) {
  return <button type={type} className={`${buttonClass(variant)} ${className ?? ""}`} {...props} />;
}
