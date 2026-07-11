import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "../../components/marketing/hero";
import { getDictionary } from "../../lib/i18n";

describe("Hero", () => {
  it("renders the localized title and role-linked CTAs", () => {
    const dict = getDictionary("en");
    render(<Hero locale="en" dict={dict} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("matched by voice");

    const creator = screen.getByRole("link", { name: dict.hero.creatorCta });
    const brand = screen.getByRole("link", { name: dict.hero.brandCta });
    expect(creator.getAttribute("href")).toBe("/en/waitlist?role=creator");
    expect(brand.getAttribute("href")).toBe("/en/waitlist?role=brand");
  });

  it("uses Spanish copy for the es locale", () => {
    render(<Hero locale="es" dict={getDictionary("es")} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("conectados por voz");
  });
});
