import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../../components/ui/button";
import { HowItWorks } from "../../components/marketing/how-it-works";
import { TwoSided } from "../../components/marketing/two-sided";
import { getMarketing } from "../../lib/marketing";

const marketing = getMarketing("en");

describe("Button", () => {
  it("renders its children and defaults to type=button", () => {
    render(<Button>Request access</Button>);
    const button = screen.getByRole("button", { name: "Request access" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies the accent variant classes", () => {
    render(<Button variant="accent">Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("bg-accent");
  });
});

describe("HowItWorks", () => {
  it("renders every step with a numbered index", () => {
    render(<HowItWorks howItWorks={marketing.howItWorks} />);
    expect(screen.getByRole("heading", { name: marketing.howItWorks.title })).toBeInTheDocument();
    for (const step of marketing.howItWorks.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.body)).toBeInTheDocument();
    }
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });
});

describe("TwoSided", () => {
  it("renders both the creator and brand sides with their points", () => {
    render(<TwoSided creator={marketing.creator} brand={marketing.brand} />);
    expect(screen.getByText(marketing.creator.title)).toBeInTheDocument();
    expect(screen.getByText(marketing.brand.title)).toBeInTheDocument();
    for (const point of [...marketing.creator.points, ...marketing.brand.points]) {
      expect(screen.getByText(point)).toBeInTheDocument();
    }
  });
});
