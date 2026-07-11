import type { Dictionary } from "../../lib/i18n";
import { Reveal } from "./reveal";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.marketing.how;
  return (
    <section className="section" id="how" aria-labelledby="how-title">
      <div className="container">
        <Reveal className="sec-head">
          <h2 id="how-title" className="sec-title">
            {h.title}
          </h2>
          <p className="sec-sub">{h.subtitle}</p>
        </Reveal>

        <ol className="steps" style={{ listStyle: "none", padding: 0 }}>
          {h.steps.map((step, i) => (
            <Reveal as="li" key={step.no} delay={i * 90} className="step">
              <div className="step-no">{step.no}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-body">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
