import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const base = process.env.WORKSPACE_VERIFY_BASE || "http://localhost:3062";
const shots = process.env.WORKSPACE_VERIFY_SHOTS;
const browserModule = process.env.WORKSPACE_VERIFY_PLAYWRIGHT || ".tools/browser/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(resolve(browserModule)).href);
const browser = await chromium.launch({ channel: "chrome" });
const readOnly = process.env.WORKSPACE_VERIFY_READ_ONLY === "1";
const unexpected = [];

if (shots) await mkdir(shots, { recursive: true });

async function expectPath(page, expected) {
  await page.waitForURL(url => url.pathname === expected);
}

async function show(page, path) {
  const response = await page.goto(base + path);
  assert.equal(response.status(), 200, path);
  await page.locator("main").first().waitFor();
}

async function fits(page, label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + " overflows");
}

try {
  for (const width of [375, 390, 768, 850, 851, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width === 851 ? 490 : 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", error => unexpected.push(error.message));
    const desktop = width >= 851;
    const target = readOnly ? "/new-york/practice/" : "/new-york/practice/?mode=quick&start=1";
    await show(page, target);
    if (!readOnly) {
      await page.locator(".quiz-stem").last().waitFor();
      if (!desktop) await page.waitForFunction(() => {
        const topbar = document.querySelector(".study-topbar");
        const action = document.querySelector(".quiz-meta-actions button");
        return topbar && action && action.getBoundingClientRect().top >= topbar.getBoundingClientRect().bottom;
      });
    }
    await fits(page, "practice at " + width);
    const panel = desktop ? page.locator("aside.study-sidebar") : page.getByRole("dialog", { name: "Study navigation" });
    const menuButton = page.getByRole("button", { name: "Open study navigation" });

    if (shots && [390, 1440].includes(width)) {
      await page.addStyleTag({ content: "nextjs-portal {display:none}" });
      await page.screenshot({ path: resolve(shots, "practice-" + width + ".png") });
    }

    if (desktop) {
      assert.equal(await menuButton.isVisible(), false);
      const collapse = panel.getByRole("button", { name: "Collapse sidebar" });
      if (shots && width === 1440) await panel.screenshot({ path: resolve(shots, "sidebar-1440.png") });
      const wide = await panel.evaluate(el => el.offsetWidth);
      await collapse.click();
      await panel.getByRole("button", { name: "Expand sidebar" }).waitFor();
      assert.ok(await panel.evaluate(el => el.offsetWidth) < wide);
      if (width === 1440) {
        await panel.getByRole("link", { name: "Notary Exam Prep" }).click();
        await expectPath(page, "/");
        await page.goBack();
        await expectPath(page, "/new-york/practice/");
        await panel.getByRole("button", { name: "Expand sidebar" }).waitFor();
      }
      await page.reload();
      await panel.getByRole("button", { name: "Expand sidebar" }).click();
      assert.equal(await panel.evaluate(el => el.offsetWidth), wide);
    } else {
      assert.equal(await page.locator("aside.study-sidebar").isVisible(), false);
      await menuButton.click();
      await panel.waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Close navigation");
      assert.equal(await menuButton.getAttribute("aria-expanded"), "true");
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), "hidden");
      for (let tab = 0; tab < 24; tab++) {
        await page.keyboard.press("Tab");
        // Browser chrome can temporarily own focus before it wraps.
        assert.ok(await page.evaluate(() => document.activeElement === document.body || document.querySelector("dialog.study-drawer")?.contains(document.activeElement)));
      }
      if (shots && width === 390) await page.screenshot({ path: resolve(shots, "drawer-390.png") });
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
      assert.ok(await menuButton.evaluate(node => document.activeElement === node));
      await menuButton.click();
      await page.mouse.click(width - 5, 200);
      await panel.waitFor({ state: "hidden" });
      if (width === 850) {
        await menuButton.click();
        await page.setViewportSize({ width: 851, height: 490 });
        await panel.waitFor({ state: "hidden" });
        assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), "hidden");
        await page.setViewportSize({ width, height: 900 });
      }
      await menuButton.click();
    }

    const practice = panel.getByRole("link", { name: "Practice", exact: true });
    assert.equal(await practice.getAttribute("aria-current"), "page");
    const resources = panel.getByRole("button", { name: "Exam & resources" });
    await resources.click();
    await panel.getByRole("link", { name: "Exam Guide" }).waitFor();
    await panel.getByRole("button", { name: /Choose state/ }).click();
    await panel.getByRole("menuitem", { name: /California \(CA\)/ }).click();
    await expectPath(page, "/california/practice/");
    assert.equal(await page.locator("html").getAttribute("data-state"), "CA");
    await page.goBack();
    await expectPath(page, "/new-york/practice/");
    await page.goForward();
    await expectPath(page, "/california/practice/");
    await fits(page, "California after navigation");
    console.log("PASS workspace", width);
    await context.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(15000);
  await show(page, "/california/pricing/");
  const sidebar = page.locator("aside.study-sidebar");
  await sidebar.getByRole("button", { name: /Choose state/ }).click();
  const texas = sidebar.getByRole("menuitem", { name: /Texas \(TX\)/ });
  assert.match(await texas.innerText(), /State overview/);
  await texas.click();
  await expectPath(page, "/texas/");
  await sidebar.getByRole("link", { name: "Pro plans" }).click();
  await expectPath(page, "/pricing/");
  await sidebar.getByRole("link", { name: "Contact Us" }).click();
  await expectPath(page, "/contact/");
  await sidebar.getByRole("link", { name: "Community Insights" }).click();
  await expectPath(page, "/community-insights/");
  await show(page, "/new-york/practice/");
  const favorites = sidebar.getByRole("link", { name: "Favorites", exact: true });
  await page.waitForFunction(() => [...document.querySelectorAll(".study-sidebar a")].some(link => link.getAttribute("aria-label") === "Favorites" && link.getAttribute("href")?.includes("/login")));
  await favorites.click();
  await expectPath(page, "/login/");
  assert.equal(new URL(page.url()).searchParams.get("next"), "/new-york/wrong-answers/?view=favorites");
  assert.equal(await sidebar.count(), 0);
  await show(page, "/");
  assert.equal(await sidebar.count(), 0);
  await page.getByRole("heading", { name: /Know the rule/ }).waitFor();
  assert.ok(await page.locator(".editorial-table").isVisible());
  assert.ok(await page.locator(".editorial-final").isVisible());
  assert.deepEqual(unexpected, []);
  console.log("PASS state capability fallback, contact, pricing, community, favorites login return and national homepage");
} finally {
  await browser.close();
}
