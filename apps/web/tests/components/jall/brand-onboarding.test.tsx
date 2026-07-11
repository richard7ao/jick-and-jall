import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandOnboarding } from "../../../components/jall/brand-onboarding";

describe("BrandOnboarding", () => {
  it("requires a brief and positive budget before creating a draft", () => {
    render(<BrandOnboarding locale="en" />);
    const create = screen.getByRole("button", { name: "Create draft" });
    expect(create).toHaveProperty("disabled", true);
    fireEvent.change(screen.getByLabelText("Describe your campaign"), { target: { value: "Summer UGC" } });
    fireEvent.change(screen.getByLabelText("Budget (GBP)"), { target: { value: "5000" } });
    expect(create).toHaveProperty("disabled", false);
    fireEvent.click(create);
    expect(screen.getByRole("status").textContent).toBe("Draft created");
  });

  it("localizes to Spanish", () => {
    render(<BrandOnboarding locale="es" />);
    expect(screen.getByLabelText("Describe tu campaña")).toBeDefined();
  });
});
