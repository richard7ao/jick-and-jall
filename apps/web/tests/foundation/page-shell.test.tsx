import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageShell } from "../../components/foundation/page-shell";

describe("PageShell", () => {
  it("renders a main landmark, a skip link, and its children", () => {
    render(
      <PageShell locale="es">
        <p>hola</p>
      </PageShell>,
    );
    expect(screen.getByRole("main")).toBeDefined();
    expect(screen.getByText("Skip to content")).toBeDefined();
    expect(screen.getByText("hola")).toBeDefined();
  });

  it("exposes the active locale for styling/testing hooks", () => {
    const { container } = render(
      <PageShell locale="en">
        <span>x</span>
      </PageShell>,
    );
    expect(container.querySelector('[data-locale="en"]')).not.toBeNull();
  });
});
