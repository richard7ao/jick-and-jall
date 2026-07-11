import { expect, test } from "@playwright/test";

// Invited-auth + private-media journey (deferred: needs auth emulator + a seeded
// invitation and signed-in session). Run via the firebase:exec wrapper once the
// auth UI and storage client are wired.
test("private media is not publicly accessible", async ({ request }) => {
  const res = await request.get("/api/media?path=recordings/someone/rec", { failOnStatusCode: false });
  expect(res.status()).toBe(404);
});
