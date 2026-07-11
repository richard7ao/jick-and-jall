import type { ComponentProps } from "react";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-5xl px-6 ${className ?? ""}`} {...props} />;
}
