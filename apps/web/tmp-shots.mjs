import { chromium } from "@playwright/test";
const shots = [
  ["en-desktop", "http://localhost:3000/en", 1440, 900, false],
  ["es-desktop", "http://localhost:3000/es", 1440, 900, false],
  ["en-mobile", "http://localhost:3000/en", 390, 844, true],
  ["waitlist-desktop", "http://localhost:3000/en/waitlist?role=brand", 1440, 900, false],
];
const browser = await chromium.launch({ channel: "chrome" });
for (const [name, url, w, h, mobile] of shots) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  // Scroll through to trigger scroll reveals, then back to top.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `/tmp/shot-${name}.png`, fullPage: true });
  console.log(name, "OK", errors.length ? "ERRORS:" + errors.join("|") : "");
  await ctx.close();
}
await browser.close();
