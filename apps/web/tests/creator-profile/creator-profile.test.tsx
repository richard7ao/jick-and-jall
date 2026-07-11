import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileEditor } from "../../components/creator-profile/profile-editor";
import { RecordingsList } from "../../components/recordings/recordings-list";

afterEach(() => vi.restoreAllMocks());

describe("ProfileEditor", () => {
  it("saves edited fields via PUT and shows the saved state", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    render(<ProfileEditor locale="en" initial={{ displayName: "Ari", bio: "", published: false, available: true }} />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Saved"));
    const init = spy.mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("PUT");
  });
});

describe("RecordingsList", () => {
  it("renders empty state and an export action", () => {
    const onExport = vi.fn();
    render(
      <RecordingsList locale="es" recordings={[]} onPlay={() => {}} onDelete={() => {}} onExport={onExport} />,
    );
    expect(screen.getByText("Aún no hay grabaciones.")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Exportar mis datos" }));
    expect(onExport).toHaveBeenCalled();
  });

  it("invokes delete for a specific recording", () => {
    const onDelete = vi.fn();
    render(
      <RecordingsList
        locale="en"
        recordings={[{ id: "r1", createdAt: "2026-07-11" }]}
        onPlay={() => {}}
        onDelete={onDelete}
        onExport={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete r1" }));
    expect(onDelete).toHaveBeenCalledWith("r1");
  });
});
