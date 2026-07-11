import { expect, test } from "@playwright/test";

// Full bilingual waitlist journey. Run via:
//   pnpm firebase:exec -- pnpm --filter @jj/web exec playwright test e2e/marketing-waitlist.spec.ts
for (const locale of ["en", "es"] as const) {
  test(`waitlist journey (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.getByRole("link", { name: /creator|creador/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/waitlist`));

    await page.getByLabel(/email|correo/i).fill("e2e@example.com");
    await page.getByRole("checkbox").check();
    await page.getByRole("button").click();

    await expect(page.getByRole("status")).toBeVisible();
  });
}
