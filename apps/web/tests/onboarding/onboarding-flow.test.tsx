import { act, renderHook } from "@testing-library/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OnboardingFlow } from "../../components/onboarding/onboarding-flow";
import { useVoiceSession } from "../../hooks/use-voice-session";

describe("useVoiceSession", () => {
  it("preserves captured turns when voice fails (text fallback)", () => {
    const { result } = renderHook(() => useVoiceSession());
    act(() => result.current.begin());
    act(() => result.current.addTurn({ role: "user", text: "hi" }));
    act(() => result.current.fail());
    expect(result.current.status).toBe("failed");
    expect(result.current.turns).toHaveLength(1); // progress not lost
  });
});

describe("OnboardingFlow", () => {
  it("offers voice and an always-available text path, saving a draft", () => {
    render(<OnboardingFlow locale="en" />);
    expect(screen.getByRole("button", { name: "Talk to Jick" })).toBeDefined();
    const textarea = screen.getByLabelText("Tell us about your content");
    fireEvent.change(textarea, { target: { value: "I make travel videos" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.getByRole("status").textContent).toBe("Draft saved");
  });

  it("uses Spanish copy for es", () => {
    render(<OnboardingFlow locale="es" />);
    expect(screen.getByRole("button", { name: "Habla con Jick" })).toBeDefined();
  });
});
