import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MatchList, type MatchRow } from "../../../components/matches/match-list";

const rows: MatchRow[] = [{ id: "m1", label: "Ari", score: 0.87, disclosureConsented: false }];

describe("MatchList", () => {
  it("lets a creator consent to disclosure", () => {
    const onConsent = vi.fn();
    render(<MatchList locale="en" role="creator" matches={rows} onConsent={onConsent} onMessage={() => {}} />);
    expect(screen.getByLabelText("Score").textContent).toBe("87%");
    fireEvent.click(screen.getByRole("button", { name: "Share my details" }));
    expect(onConsent).toHaveBeenCalledWith("m1");
  });

  it("disables brand messaging until the creator has consented", () => {
    render(<MatchList locale="en" role="brand" matches={rows} onConsent={() => {}} onMessage={() => {}} />);
    expect(screen.getByRole("button", { name: "Message" })).toHaveProperty("disabled", true);
  });

  it("enables brand messaging once consented", () => {
    const onMessage = vi.fn();
    render(
      <MatchList
        locale="es"
        role="brand"
        matches={[{ ...rows[0]!, disclosureConsented: true }]}
        onConsent={() => {}}
        onMessage={onMessage}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mensaje" }));
    expect(onMessage).toHaveBeenCalledWith("m1");
  });
});
