import { expect, test } from "@playwright/test";

test("preselects the role from the query string", async ({ page }) => {
  await page.goto("/en/waitlist?role=brand");
  await expect(page.getByRole("radio", { name: "Brand" })).toBeChecked();
});

test("blocks submission and shows validation errors when empty", async ({ page }) => {
  await page.goto("/en/waitlist");
  await page.getByRole("button", { name: "Request access" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Please agree to be contacted.")).toBeVisible();
});

test("submits a valid entry and confirms success", async ({ page }) => {
  await page.route("**/api/waitlist", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/en/waitlist?role=creator");
  await page.getByLabel("Email address").fill("creator@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request access" }).click();

  await expect(page.getByTestId("waitlist-success")).toBeVisible();
});

test("shows an error when the API rejects the request", async ({ page }) => {
  await page.route("**/api/waitlist", (route) => route.fulfill({ status: 500 }));

  await page.goto("/es/waitlist?role=creator");
  await page.getByLabel("Correo electrónico").fill("creador@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Solicitar acceso" }).click();

  await expect(page.getByText("Algo salió mal. Inténtalo de nuevo.")).toBeVisible();
});
