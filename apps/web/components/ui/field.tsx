import type { ComponentProps, ReactNode } from "react";

export function Field({
  label,
  id,
  hint,
  error,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-display font-bold">
        {label}
        {hint ? <span className="ml-1 font-body text-sm font-normal text-dim">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`rounded-lg border-[1.5px] border-border bg-bg px-4 py-3 placeholder:text-dim focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className ?? ""}`}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={`min-h-28 rounded-lg border-[1.5px] border-border bg-bg px-4 py-3 placeholder:text-dim focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className ?? ""}`}
      {...props}
    />
  );
}
