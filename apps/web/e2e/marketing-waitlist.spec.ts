import { expect, test, type Page } from "@playwright/test";

/** Drive the full marketing -> waitlist -> success journey for one locale. */
async function completeJourney(
  page: Page,
  locale: "en" | "es",
  labels: { join: string; email: string; submit: string },
): Promise<void> {
  await page.goto(`/${locale}`);
  await expect(page.getByTestId("hero-title")).toBeVisible();

  await page.getByRole("link", { name: labels.join }).first().click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/waitlist`));

  // Role radios are visually hidden (sr-only); force past the visibility check.
  await page.getByRole("radio").first().check({ force: true });
  await page.getByLabel(labels.email).fill(`someone@example.com`);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: labels.submit }).click();

  await expect(page.getByTestId("waitlist-success")).toBeVisible();
}

test("completes the bilingual waitlist journey without leaking PII to analytics", async ({
  page,
}) => {
  const analyticsBodies: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/analytics")) {
      analyticsBodies.push(request.postData() ?? "");
    }
  });
  await page.route("**/api/waitlist", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: "{}" }),
  );

  await completeJourney(page, "en", {
    join: "Join the waitlist",
    email: "Email address",
    submit: "Request access",
  });

  await completeJourney(page, "es", {
    join: "Unirse a la lista",
    email: "Correo electrónico",
    submit: "Solicitar acceso",
  });

  // Analytics must actually have fired (otherwise the privacy check is vacuous)...
  expect(analyticsBodies.length).toBeGreaterThan(0);
  // ...and nothing sent to analytics may contain an email address.
  expect(analyticsBodies.every((body) => !body.includes("@"))).toBe(true);
});
