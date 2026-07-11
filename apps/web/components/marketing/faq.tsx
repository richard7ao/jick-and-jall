"use client";

import { useState } from "react";
import type { Dictionary } from "../../lib/i18n";
import { Reveal } from "./reveal";

export function Faq({ dict }: { dict: Dictionary }) {
  const f = dict.marketing.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container-narrow">
        <Reveal className="sec-head">
          <h2 id="faq-title" className="sec-title">
            {f.title}
          </h2>
        </Reveal>

        <div className="faq-list">
          {f.items.map((item, i) => {
            const expanded = open === i;
            const panelId = `faq-panel-${i}`;
            return (
              <div className="faq-item" key={item.q}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div className="faq-panel" id={panelId} data-open={expanded} role="region">
                  <div>
                    <p className="faq-a">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
