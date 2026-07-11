import { expect, test } from "@playwright/test";

test("creator accepts an opportunity and contact is revealed", async ({ page }) => {
  await page.route("**/api/matches?role=creator", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "m1", brandName: "Acme", fitReason: "Shares your sustainability focus." },
      ]),
    }),
  );
  await page.route("**/api/matches/m1/consent", (route) =>
    route.fulfill({ status: 200, body: "{}" }),
  );

  await page.goto("/en/creator/opportunities");
  await expect(page.getByText("Shares your sustainability focus.")).toBeVisible();
  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText("Contact details are now available in your inbox.")).toBeVisible();
});

test("brand match list shows fit reasons without scores", async ({ page }) => {
  await page.route("**/api/matches?role=brand", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "m1",
          alias: "Creator A",
          fitReason: "Great audience overlap.",
          status: "awaiting_consent",
        },
      ]),
    }),
  );

  await page.goto("/en/brand/matches");
  await expect(page.getByText("Great audience overlap.")).toBeVisible();
  await expect(page.getByText("Waiting for the creator to accept.")).toBeVisible();
});
