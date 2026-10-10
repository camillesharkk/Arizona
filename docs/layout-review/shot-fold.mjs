import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/20683/AppData/Local/Temp/cursor-sandbox-cache/f100d92d3c061fd8544fdf569fb13bc6/npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const dest = (name) => join(dir, name);
const base = "http://localhost:3005";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${base}/arizona-notary-exam/`, { waitUntil: "networkidle" });
await page.screenshot({ path: dest("after-home-390-fold.png"), fullPage: false });

await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "networkidle" });
await page.screenshot({ path: dest("after-practice-390-fold.png"), fullPage: false });

await page.locator("button.card", { hasText: "Quick 10" }).click();
await page.waitForSelector(".q-option");
for (let i = 0; i < 4; i++) {
  await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "networkidle" });
  await page.locator("button.card", { hasText: "Quick 10" }).click();
  await page.waitForSelector(".q-option");
  await page.locator(".q-option").nth(i).click();
  await page.waitForTimeout(350);
  if (await page.locator(".explain", { hasText: "Not quite" }).count()) break;
}
await page.locator("details.explain, .explain details").first().evaluate((el) => {
  if (el instanceof HTMLDetailsElement) el.open = true;
});
await page.locator(".exam-pad > .notice").last().scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: dest("after-quiz-wrong-390-nav.png"), fullPage: false });
const overlap = await page.evaluate(() => {
  const nav = document.querySelector(".sticky-nav")?.getBoundingClientRect();
  const boxes = [...document.querySelectorAll(".explain, .exam-pad > .notice")].map((el) => {
    const b = el.getBoundingClientRect();
    return {
      text: (el.textContent || "").slice(0, 40),
      top: Math.round(b.top),
      bottom: Math.round(b.bottom),
      covered: Boolean(nav && b.bottom > nav.top + 4 && b.top < nav.bottom - 4 && b.bottom - Math.max(b.top, nav.top) > 8),
    };
  });
  return { nav: nav && { top: Math.round(nav.top), bottom: Math.round(nav.bottom) }, boxes, vh: window.innerHeight };
});
console.log("NAV_OVERLAP", JSON.stringify(overlap, null, 2));
await browser.close();
