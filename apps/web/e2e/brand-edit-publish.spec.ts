import { expect, test } from "@playwright/test";

test("brand campaign brief validates budget before publishing", async ({ page }) => {
  await page.route("**/api/jall/campaign", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/en/brand/campaigns");

  // Invalid budget blocks publish.
  await page.getByLabel("Budget (GBP)").fill("5");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Enter a whole amount between £50 and £10,000.")).toBeVisible();

  // Valid budget publishes.
  await page.getByLabel("Budget (GBP)").fill("500");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published.")).toBeVisible();
});
