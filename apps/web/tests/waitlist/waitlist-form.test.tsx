import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WaitlistForm } from "../../components/waitlist/waitlist-form";
import { getDictionary } from "../../lib/i18n";

const dict = getDictionary("en");

afterEach(() => vi.restoreAllMocks());

describe("WaitlistForm", () => {
  it("blocks submission until consent is given (no network call)", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<WaitlistForm locale="en" dict={dict} />);
    fireEvent.change(screen.getByLabelText(dict.waitlistForm.emailLabel), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: dict.waitlistForm.submit }));
    expect(screen.getByRole("alert")).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits to the API with consent and shows the success state", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 }));
    render(<WaitlistForm locale="en" dict={dict} initialRole="brand" />);

    fireEvent.change(screen.getByLabelText(dict.waitlistForm.emailLabel), {
      target: { value: "brand@x.com" },
    });
    fireEvent.click(screen.getByLabelText(dict.waitlistForm.consent));
    fireEvent.click(screen.getByRole("button", { name: dict.waitlistForm.submit }));

    await waitFor(() => expect(screen.getByText(dict.waitlistForm.success)).toBeDefined());
    expect(fetchSpy).toHaveBeenCalledOnce();
    const body = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.role).toBe("brand");
    expect(body.consent.accepted).toBe(true);
  });
});
