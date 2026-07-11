import { expect, test } from "@playwright/test";

test("sets html lang per locale", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("unknown path recovers via a 404 with a home link", async ({ page }) => {
  const response = await page.goto("/en/nope-not-here");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
});

test("waitlist form is labelled and keyboard reachable", async ({ page }) => {
  await page.goto("/en/waitlist");
  // Labels resolve (accessible names present).
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Creator" })).toBeAttached();
  await expect(page.getByRole("radio", { name: "Brand" })).toBeAttached();
  // Submitting empty announces errors via role=alert.
  await page.getByRole("button", { name: "Request access" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
});
