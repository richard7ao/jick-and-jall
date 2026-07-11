import { expect, test } from "@playwright/test";

test("shows payout setup when Connect is not ready", async ({ page }) => {
  await page.route("**/api/payouts/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ready: false }),
    }),
  );

  await page.goto("/en/settings/payouts");
  await expect(page.getByText("Payout setup is incomplete.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Set up payouts" })).toBeVisible();
});

test("funding page states that the server, not the return page, confirms payment", async ({
  page,
}) => {
  await page.goto("/en/deals/d1/fund");
  await expect(
    page.getByText("Payment is confirmed by our server after checkout — not by the return page."),
  ).toBeVisible();
});
