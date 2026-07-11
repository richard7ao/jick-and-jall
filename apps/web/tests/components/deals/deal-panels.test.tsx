import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfferPanel } from "../../../components/offers/offer-panel";
import { DeliveryPanel } from "../../../components/delivery/delivery-panel";

describe("OfferPanel", () => {
  it("shows the GBP money breakdown and accepts once", () => {
    const onAccept = vi.fn();
    render(
      <OfferPanel
        locale="en"
        creatorAmountMinor={10000}
        platformFeeMinor={1000}
        brandChargeMinor={11000}
        accepted={false}
        onAccept={onAccept}
      />,
    );
    expect(screen.getByText("£110.00")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Accept offer" }));
    expect(onAccept).toHaveBeenCalled();
  });

  it("disables accept once accepted", () => {
    render(
      <OfferPanel locale="es" creatorAmountMinor={100} platformFeeMinor={10} brandChargeMinor={110} accepted onAccept={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Aceptada" })).toHaveProperty("disabled", true);
  });
});

describe("DeliveryPanel", () => {
  it("offers deliver only when funded", () => {
    const onAction = vi.fn();
    render(<DeliveryPanel locale="en" status="funded" onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark delivered" }));
    expect(onAction).toHaveBeenCalledWith("deliver");
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });

  it("offers approve/revision when delivered", () => {
    render(<DeliveryPanel locale="en" status="delivered" onAction={() => {}} />);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Request revision" })).toBeDefined();
  });
});
