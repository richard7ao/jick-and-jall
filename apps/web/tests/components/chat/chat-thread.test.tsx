import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatThread, type ChatMessage } from "../../../components/chat/chat-thread";

const messages: ChatMessage[] = [
  { id: "1", senderUid: "me", body: "hi" },
  { id: "2", senderUid: "them", body: "hello" },
];

describe("ChatThread", () => {
  it("aligns own vs other messages", () => {
    render(<ChatThread locale="en" currentUid="me" messages={messages} onSend={() => {}} />);
    const items = screen.getByLabelText("messages").querySelectorAll("li");
    expect(items[0]?.getAttribute("data-own")).toBe("true");
    expect(items[1]?.getAttribute("data-own")).toBe("false");
  });

  it("sends trimmed non-empty messages and clears the input", () => {
    const onSend = vi.fn();
    render(<ChatThread locale="es" currentUid="me" messages={[]} onSend={onSend} />);
    const input = screen.getByLabelText("Escribe un mensaje") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  hola  " } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSend).toHaveBeenCalledWith("hola");
    expect(input.value).toBe("");
  });

  it("does not send empty messages", () => {
    const onSend = vi.fn();
    render(<ChatThread locale="en" currentUid="me" messages={[]} onSend={onSend} />);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
