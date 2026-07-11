import { expect, test } from "@playwright/test";

test("sends a chat message with optimistic delivery", async ({ page }) => {
  await page.route("**/api/conversations/c1/messages", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ status: 201, body: "{}" });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.goto("/en/conversations/c1");
  await expect(page.getByText("Say hello to start the conversation.")).toBeVisible();

  await page.getByLabel("Write a message…").fill("Hi there https://example.com");
  await page.getByRole("button", { name: "Send" }).click();

  const messages = page.getByTestId("messages");
  await expect(messages.getByText("Hi there", { exact: false })).toBeVisible();
  await expect(messages.getByRole("link", { name: "https://example.com" })).toBeVisible();
});
