import { expect, test } from "@playwright/test";

test("renders the marketing story with a working waitlist CTA (English)", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("hero-title")).toHaveText("Creators and brands, matched by voice.");
  await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();

  const joinLinks = page.getByRole("link", { name: "Join the waitlist" });
  await expect(joinLinks.first()).toBeVisible();
  await expect(joinLinks.first()).toHaveAttribute("href", "/en/waitlist");
});

test("shows the two-sided value proposition", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("Jick gets to know your work")).toBeVisible();
  await expect(page.getByText("Jall shapes your brief")).toBeVisible();
});

test("serves Spanish marketing copy at /es", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "Cómo funciona" })).toBeVisible();
});
