import { expect, test } from "@playwright/test";

test("serves the English foundation page", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("matched by voice");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("serves the Spanish foundation page", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("conectados por voz");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("redirects a locale-less path to a supported locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|es)$/);
  await expect(page.getByRole("main")).toBeVisible();
});
