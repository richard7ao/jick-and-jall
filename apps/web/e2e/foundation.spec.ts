import { expect, test } from "@playwright/test";

test("redirects the bare root to a locale-prefixed path", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|es)$/);
});

test("renders the English hero at /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("hero-title")).toHaveText("Creators and brands, matched by voice.");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("renders the Spanish hero at /es", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByTestId("hero-title")).not.toHaveText(
    "Creators and brands, matched by voice.",
  );
});

test("honours Accept-Language when negotiating the redirect", async ({ browser }) => {
  const context = await browser.newContext({ locale: "es-ES" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
  await context.close();
});

test("shows a 404 for an unknown path under a locale", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist");
  expect(response?.status()).toBe(404);
});
