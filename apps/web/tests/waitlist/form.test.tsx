import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WaitlistForm } from "../../components/waitlist/waitlist-form";
import { getDictionary } from "../../lib/dictionary";
import { getWaitlistCopy } from "../../lib/waitlist";

const form = getDictionary("en").waitlistForm;
const copy = getWaitlistCopy("en");

function renderForm() {
  return render(<WaitlistForm locale="en" form={form} copy={copy} initialRole={null} />);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WaitlistForm", () => {
  it("shows validation errors and does not submit when empty", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: form.submit }));

    expect(screen.getByText(copy.errors.role)).toBeInTheDocument();
    expect(screen.getByText(copy.errors.email)).toBeInTheDocument();
    expect(screen.getByText(copy.errors.consent)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits a valid entry and shows the success state", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 201 }));
    renderForm();

    fireEvent.click(screen.getByRole("radio", { name: form.roleCreator }));
    fireEvent.change(screen.getByLabelText(form.emailLabel), {
      target: { value: "creator@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: form.submit }));

    await waitFor(() =>
      expect(screen.getByTestId("waitlist-success")).toHaveTextContent(form.success),
    );
    expect(fetchSpy).toHaveBeenCalledWith("/api/waitlist", expect.any(Object));
  });

  it("surfaces a generic error when the request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    renderForm();

    fireEvent.click(screen.getByRole("radio", { name: form.roleBrand }));
    fireEvent.change(screen.getByLabelText(form.emailLabel), {
      target: { value: "brand@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: form.submit }));

    await waitFor(() => expect(screen.getByText(copy.errorGeneric)).toBeInTheDocument());
  });
});
