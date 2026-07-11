import { expect, test } from "@playwright/test";

// Broad product smoke across the primary journeys, both languages where cheap.
test("public surface renders in English and Spanish", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("hero-title")).toBeVisible();
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "Cómo funciona" })).toBeVisible();
});

test("waitlist, onboarding, matches, and a deal are reachable and functional", async ({ page }) => {
  await page.route("**/api/waitlist", (r) => r.fulfill({ status: 201, body: "{}" }));
  await page.route("**/api/creator/profile", (r) => r.fulfill({ status: 201, body: "{}" }));
  await page.route("**/api/matches?role=creator", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: "m1", brandName: "Acme", fitReason: "Audience overlap." }]),
    }),
  );
  await page.route("**/api/matches/m1/consent", (r) => r.fulfill({ status: 200, body: "{}" }));
  await page.route("**/api/deals/d1/deliver", (r) => r.fulfill({ status: 200, body: "{}" }));

  // Waitlist
  await page.goto("/en/waitlist?role=creator");
  await page.getByLabel("Email address").fill("smoke@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request access" }).click();
  await expect(page.getByTestId("waitlist-success")).toBeVisible();

  // Onboarding (text)
  await page.goto("/en/creator/onboarding");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Type instead" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Finish & preview" }).click();
  await page.getByRole("button", { name: "Publish profile" }).click();
  await expect(page.getByTestId("onboarding-published")).toBeVisible();

  // Matches consent
  await page.goto("/en/creator/opportunities");
  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText("Contact details are now available in your inbox.")).toBeVisible();

  // Deal delivery
  await page.goto("/en/deals/d1?role=creator&status=funded");
  await page.getByRole("button", { name: "Submit delivery" }).click();
  await expect(page.getByTestId("deal-status")).toHaveText("Delivered");
});
