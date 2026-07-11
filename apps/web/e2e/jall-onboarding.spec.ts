import { expect, test } from "@playwright/test";

test("brand completes the Jall campaign intake in text mode", async ({ page }) => {
  await page.route("**/api/jall/campaign", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/en/brand/onboarding");
  await page.getByRole("button", { name: "Type instead" }).click();
  await page.getByRole("button", { name: "Start" }).click();

  await page.getByLabel("What are the goals of this campaign?").fill("Launch awareness");
  await page.getByRole("button", { name: "Finish & preview" }).click();

  await expect(page.getByRole("heading", { name: "Review your brief" })).toBeVisible();
  await page.getByRole("button", { name: "Publish brief" }).click();

  await expect(page.getByTestId("jall-published")).toBeVisible();
});
