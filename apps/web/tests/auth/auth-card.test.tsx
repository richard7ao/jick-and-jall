import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthCard } from "../../components/auth/auth-card";
import { AUTH_STRINGS } from "../../components/auth/auth-strings";

describe("AuthCard", () => {
  it("renders localized sign-in title and the no-switcher notice", () => {
    render(<AuthCard locale="es" mode="sign-in" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(AUTH_STRINGS.es.signInTitle);
    expect(screen.getByText(AUTH_STRINGS.es.noSwitcher)).toBeDefined();
  });

  it("switches title for register mode", () => {
    render(<AuthCard locale="en" mode="register" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(AUTH_STRINGS.en.registerTitle);
  });

  it("keeps English and Spanish auth strings at key parity", () => {
    expect(Object.keys(AUTH_STRINGS.en).sort()).toEqual(Object.keys(AUTH_STRINGS.es).sort());
  });
});
