import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell, navItemsForRole } from "../../components/app-shell/app-shell";

describe("AppShell", () => {
  it("shows role-specific navigation and no cross-role links", () => {
    render(
      <AppShell role="creator" locale="en">
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Opportunities" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Campaigns" })).toBeNull();
  });

  it("localizes nav labels and prefixes hrefs with the locale", () => {
    render(
      <AppShell role="brand" locale="es">
        <p>x</p>
      </AppShell>,
    );
    const link = screen.getByRole("link", { name: "Campañas" });
    expect(link.getAttribute("href")).toBe("/es/brand/campaigns");
  });

  it("exposes distinct nav sets per role", () => {
    expect(navItemsForRole("creator")).not.toEqual(navItemsForRole("brand"));
  });
});
