import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import type { MarketingSide } from "@/lib/marketing";

function SideCard({
  side,
  image,
  content,
}: {
  side: "jick" | "jall";
  image: string;
  content: MarketingSide;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/50 p-8">
      <div className="flex items-center justify-between">
        <Pill side={side}>{content.eyebrow}</Pill>
        <img src={image} alt="" aria-hidden width={72} height={72} />
      </div>
      <h3 className="font-display text-2xl font-extrabold">{content.title}</h3>
      <p className="text-muted">{content.body}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {content.points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm">
            <span aria-hidden className="text-primary">
              ●
            </span>
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function TwoSided({ creator, brand }: { creator: MarketingSide; brand: MarketingSide }) {
  return (
    <section className="border-t border-border py-16 md:py-24">
      <Container className="grid gap-6 md:grid-cols-2">
        <SideCard side="jick" image="/marketing/creator.svg" content={creator} />
        <SideCard side="jall" image="/marketing/brand.svg" content={brand} />
      </Container>
    </section>
  );
}
