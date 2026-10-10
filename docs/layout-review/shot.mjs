import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/20683/AppData/Local/Temp/cursor-sandbox-cache/f100d92d3c061fd8544fdf569fb13bc6/npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
mkdirSync(dir, { recursive: true });
const base = "http://localhost:3005";
const shots = [];
const dest = (name) => join(dir, name);

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.screenshot({ path: dest(name), fullPage: true });
  shots.push(name);
}

async function withViewport(size, fn) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await fn(page);
  await page.close();
}

await withViewport({ width: 390, height: 844 }, async (page) => {
  await page.goto(`${base}/arizona-notary-exam/`, { waitUntil: "networkidle" });
  await shot(page, "after-home-390.png");
  await page.click('button[aria-label="Open menu"]');
  await page.waitForSelector("#mobile-nav.nav-drawer.open");
  await page.screenshot({ path: dest("after-home-390-menu.png"), fullPage: false });
  shots.push("after-home-390-menu.png");

  await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "networkidle" });
  const launch = page.locator("button.card", { hasText: "Quick 10" });
  const sample = page.locator("#sample-questions");
  const metrics = await page.evaluate(() => {
    const q = [...document.querySelectorAll("button.card")].find((el) => el.textContent?.includes("Quick 10"));
    const s = document.querySelector("#sample-questions");
    const qr = q?.getBoundingClientRect();
    const sr = s?.getBoundingClientRect();
    return {
      quickTop: qr ? Math.round(qr.top + window.scrollY) : null,
      sampleTop: sr ? Math.round(sr.top + window.scrollY) : null,
      viewport: window.innerHeight,
      modes: [...document.querySelectorAll("button.card h3")].map((h) => h.textContent),
    };
  });
  console.log("PRACTICE_LAUNCH", JSON.stringify(metrics));
  await shot(page, "after-practice-390.png");
  await launch.click();
  await page.waitForSelector(".q-option");
  for (const letter of ["A", "B", "C", "D"]) {
    const btn = page.locator(".q-option", { hasText: new RegExp(`^${letter}\\.`) });
    if (await btn.count()) {
      await btn.first().click({ force: true });
      break;
    }
  }
  await page.waitForTimeout(400);
  const wrong = await page.locator(".explain", { hasText: "Not quite" }).count();
  if (!wrong) {
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("button.card", { hasText: "Quick 10" }).click();
    await page.waitForSelector(".q-option");
    const options = page.locator(".q-option");
    const n = await options.count();
    for (let i = 0; i < n; i++) {
      await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "networkidle" });
      await page.locator("button.card", { hasText: "Quick 10" }).click();
      await page.waitForSelector(".q-option");
      await page.locator(".q-option").nth(i).click();
      await page.waitForTimeout(350);
      if (await page.locator(".explain", { hasText: "Not quite" }).count()) break;
    }
  }
  await page.locator(".explain").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: dest("after-quiz-wrong-390.png"), fullPage: false });
  shots.push("after-quiz-wrong-390.png");
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector(".sticky-nav")?.getBoundingClientRect();
    const explain = document.querySelector(".explain")?.getBoundingClientRect();
    const source = [...document.querySelectorAll(".explain details, .exam-pad > .notice")]
      .map((el) => el.getBoundingClientRect())
      .pop();
    const covered = (box) => nav && box && box.bottom > nav.top + 2 && box.top < nav.bottom - 2;
    return {
      navTop: nav ? Math.round(nav.top) : null,
      explainBottom: explain ? Math.round(explain.bottom) : null,
      sourceBottom: source ? Math.round(source.bottom) : null,
      explainCovered: covered(explain),
      sourceCovered: covered(source),
    };
  });
  console.log("OVERLAP_390", JSON.stringify(overlap));
});

await withViewport({ width: 1024, height: 768 }, async (page) => {
  await page.goto(`${base}/arizona-notary-exam/`, { waitUntil: "networkidle" });
  await shot(page, "after-home-1024.png");
  const cols = await page.evaluate(() => {
    const grid = [...document.querySelectorAll("section.grid.grid-4")][0];
    if (!grid) return null;
    const cards = [...grid.children].map((c) => c.getBoundingClientRect().left);
    return { uniqueLeft: [...new Set(cards.map((n) => Math.round(n)))].length };
  });
  console.log("HOME_GRID_1024", JSON.stringify(cols));
  await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "networkidle" });
  await shot(page, "after-practice-1024.png");
});

await withViewport({ width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/arizona-notary-exam/`, { waitUntil: "networkidle" });
  await shot(page, "after-home-1440.png");
  await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "networkidle" });
  await shot(page, "after-practice-1440.png");
});

await browser.close();
console.log("SHOTS", shots.join(","));
