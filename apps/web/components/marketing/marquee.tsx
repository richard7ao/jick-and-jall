import type { Dictionary } from "../../lib/i18n";

/** Continuously scrolling strip of the niches Jick & Jall spans. */
export function Marquee({ dict }: { dict: Dictionary }) {
  const items = dict.marketing.marquee;
  const loop = [...items, ...items];
  return (
    <div className="marquee" aria-label={dict.marketing.hero.trustedBy}>
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span className="marquee-item" key={`${item}-${i}`} aria-hidden={i >= items.length}>
            {item}
            <span aria-hidden="true" style={{ color: "var(--color-primary)", marginLeft: "2.5rem" }}>
              /
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
