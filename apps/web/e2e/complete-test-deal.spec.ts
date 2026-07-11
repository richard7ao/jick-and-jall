import { expect, test } from "@playwright/test";

test("creator submits a delivery on a funded deal", async ({ page }) => {
  await page.route("**/api/deals/d1/deliver", (route) =>
    route.fulfill({ status: 200, body: "{}" }),
  );
  await page.goto("/en/deals/d1?role=creator&status=funded");
  await page.getByRole("button", { name: "Submit delivery" }).click();
  await expect(page.getByTestId("deal-status")).toHaveText("Delivered");
});

test("brand approves a delivered deal", async ({ page }) => {
  await page.route("**/api/deals/d1/approve", (route) =>
    route.fulfill({ status: 200, body: "{}" }),
  );
  await page.goto("/en/deals/d1?role=brand&status=delivered");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByTestId("deal-status")).toHaveText("Approved");
});
