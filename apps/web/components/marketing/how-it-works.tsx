import { Container } from "@/components/ui/container";
import type { MarketingContent } from "@/lib/marketing";

export function HowItWorks({ howItWorks }: { howItWorks: MarketingContent["howItWorks"] }) {
  return (
    <section id="how" className="border-t border-border py-16 md:py-24">
      <Container className="flex flex-col gap-10">
        <h2 className="font-display text-3xl font-extrabold">{howItWorks.title}</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-6"
            >
              <span className="font-display text-2xl font-black text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-bold">{step.title}</h3>
              <p className="text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
