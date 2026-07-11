import { expect, test } from "@playwright/test";

test("brand sends versioned offers with a 10% charge breakdown", async ({ page }) => {
  await page.route("**/api/deals/d1/offers", (route) => route.fulfill({ status: 201, body: "{}" }));

  await page.goto("/en/deals/d1?role=brand&status=offered");

  await page.getByLabel("Creator amount (GBP)").fill("500");
  await expect(page.getByTestId("brand-charge")).toHaveText("£550.00");
  await page.getByRole("button", { name: "Send offer" }).click();

  await page.getByLabel("Creator amount (GBP)").fill("600");
  await page.getByRole("button", { name: "Send offer" }).click();

  const history = page.getByTestId("offer-history");
  await expect(history.getByText("v1", { exact: false })).toBeVisible();
  await expect(history.getByText("v2", { exact: false })).toBeVisible();
});
