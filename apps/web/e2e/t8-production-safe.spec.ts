import { expect, test } from "@playwright/test";

// Guards that the app performs no unsafe, irreversible action from the UI alone.
test("funding is server-confirmed, not inferred from the return page", async ({ page }) => {
  await page.goto("/en/deals/d1/fund");
  await expect(
    page.getByText("Payment is confirmed by our server after checkout — not by the return page."),
  ).toBeVisible();
});

test("fund button does not navigate/charge without a server checkout URL", async ({ page }) => {
  // Server returns no URL -> the client must NOT redirect or fabricate a charge.
  await page.route("**/api/deals/d1/checkout", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/en/deals/d1/fund");
  await page.getByRole("button", { name: "Pay securely" }).click();
  await expect(page).toHaveURL(/\/en\/deals\/d1\/fund$/);
});

test("analytics never carries an email address", async ({ page }) => {
  const bodies: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/analytics")) bodies.push(r.postData() ?? "");
  });
  await page.route("**/api/waitlist", (r) => r.fulfill({ status: 201, body: "{}" }));
  await page.goto("/en/waitlist?role=creator");
  await page.getByLabel("Email address").fill("private@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request access" }).click();
  await expect(page.getByTestId("waitlist-success")).toBeVisible();
  expect(bodies.every((b) => !b.includes("@"))).toBe(true);
});
