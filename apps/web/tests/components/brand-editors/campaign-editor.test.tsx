import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignEditor } from "../../../components/brand-editors/campaign-editor";

describe("CampaignEditor", () => {
  it("shows draft status and publishes on demand", () => {
    render(<CampaignEditor locale="en" initial={{ title: "Summer", brief: "UGC", status: "draft" }} />);
    expect(screen.getByLabelText("status").textContent).toBe("Draft");
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(screen.getByLabelText("status").textContent).toBe("Published");
  });

  it("disables publish once published (Spanish)", () => {
    render(<CampaignEditor locale="es" initial={{ title: "Verano", brief: "UGC", status: "published" }} />);
    expect(screen.getByRole("button", { name: "Publicar" })).toHaveProperty("disabled", true);
  });
});
