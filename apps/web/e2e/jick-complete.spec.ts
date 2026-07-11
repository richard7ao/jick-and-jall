import { expect, test } from "@playwright/test";

test("creator completes the Jick onboarding flow in text mode", async ({ page }) => {
  await page.route("**/api/creator/profile", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/en/creator/onboarding");

  // Consent
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start" }).click();

  // Mode selection -> text
  await page.getByRole("button", { name: "Type instead" }).click();
  await page.getByRole("button", { name: "Start" }).click();

  // Interview
  await page.getByLabel("What niche or topics do you create in?").fill("Sustainable cooking");
  await page.getByRole("button", { name: "Finish & preview" }).click();

  // Preview -> publish
  await expect(page.getByRole("heading", { name: "Review your profile" })).toBeVisible();
  await page.getByRole("button", { name: "Publish profile" }).click();

  await expect(page.getByTestId("onboarding-published")).toBeVisible();
});
