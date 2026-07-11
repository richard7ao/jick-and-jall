"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Content is fully visible by default (SSR / no-JS /
 * reduced-motion friendly); JavaScript opts into the hidden start state on
 * mount and reveals the element once it scrolls into view.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    setArmed(true);
    const reveal = () => {
      setVisible(true);
      observer.disconnect();
      window.clearTimeout(safety);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    // Safety net: never leave content hidden if the observer never fires
    // (e.g. element rendered below the fold in a headless capture, or a stalled
    // scroll). Content still animates in; it just can't get stuck invisible.
    const safety = window.setTimeout(reveal, 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  const classes = [armed ? "reveal-ready" : "", visible ? "is-in" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={classes || undefined}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
