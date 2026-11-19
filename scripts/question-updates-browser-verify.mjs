import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { TEST_PASSWORD } from "./pack-test-utils.mjs";

const base = new URL(process.env.QUESTION_UPDATES_TEST_URL || `http://127.0.0.1:${process.env.QUESTION_UPDATES_TEST_PORT || "3819"}`);
assert.equal(base.hostname, "127.0.0.1", "Run this acceptance test against the isolated local app and fresh pack fixtures.");
const { chromium } = await import(pathToFileURL(path.resolve(
  process.env.QUESTION_UPDATES_PLAYWRIGHT || ".tools/browser/node_modules/playwright/index.mjs",
)));
let browser;
let server;
const surface = "/california/study-guide/";
const api = "/api/question-updates/";
const eventId = "ca-054-v2";
const json = async (response, status = 200) => {
  assert.equal(response.status(), status, await response.text());
  return response.json();
};

async function login(context, name) {
  await json(await context.request.post("/api/auth/login/", { data: { email: `pack-${name}@example.invalid`, password: TEST_PASSWORD } }));
}

try {
  if (!process.env.QUESTION_UPDATES_TEST_URL) {
    const env = { ...process.env, AUTH_SECRET: randomUUID() + randomUUID(),
      NOTARY_DATA_DIR: path.resolve(".tools", "editorial-" + randomUUID()), NEXT_TELEMETRY_DISABLED: "1" };
    delete env.DATABASE_URL;
    assert.equal(spawnSync(process.execPath, ["scripts/pack-test-utils.mjs", "--seed"], { env, stdio: "inherit" }).status, 0);
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", base.hostname, "--port", base.port], { env, windowsHide: true });
    const ready = await new Promise(resolve => {
      const timeout = setTimeout(() => resolve(false), 20_000);
      server.stdout.on("data", chunk => {
        if (chunk.toString().includes("Ready")) { clearTimeout(timeout); resolve(true); }
      });
      server.stderr.pipe(process.stderr);
      server.once("exit", () => { clearTimeout(timeout); resolve(false); });
      server.once("error", () => { clearTimeout(timeout); resolve(false); });
    });
    assert.equal(ready, true, "Build the isolated app before running the browser acceptance test.");
  }
  browser = await chromium.launch({ channel: process.env.QUESTION_UPDATES_BROWSER_CHANNEL || "msedge", headless: true });
  const first = await browser.newContext({ baseURL: base.href, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const second = await browser.newContext({ baseURL: base.href });
  const unaffected = await browser.newContext({ baseURL: base.href });
  const pro = await browser.newContext({ baseURL: base.href });
  await login(first, "free-desktop");
  await login(second, "free-desktop");
  await login(unaffected, "free-mobile");
  await login(pro, "pro-mobile");
  const proUrl = "/api/question-updates/ri-184-v2/";
  const freeSurface = await unaffected.request.get(proUrl);
  const proSurface = await pro.request.get(proUrl);
  assert.equal((await json(freeSurface)).question, null);
  assert.ok((await json(proSurface)).question.explanation);
  assert.equal((await json(await first.request.get(api))).receipts[eventId], undefined, "Seed fresh test data before running");
  const answer = (questionId, questionVersion, selected, attemptId) =>
    first.request.post("/api/progress/", { data: { questionId, state: "CA", questionVersion, selected, attemptId } });
  const firstAnswer = await json(await answer("ca-054", 1, "A", "edit-old-ca054"));
  assert.equal(firstAnswer.correct, undefined, "Untokened progress cannot reveal the key");
  assert.equal(firstAnswer.stat.wrongCount, 1);
  assert.equal((await json(await answer("ca-079", 1, "B", "edit-old-ca079"))).stat.rightCount, 1);
  await json(await first.request.post("/api/mistakes/", { data: { questionId: "ca-054", favorited: true } }));
  await json(await answer("ca-054", 99, "A", "edit-unknown-ca054"), 409);

  const page = await first.newPage();
  // Hold acknowledgments to simulate the network failing after the dialog was offered.
  await page.route("**/api/question-updates/", async route => {
    if (route.request().method() === "POST" && route.request().postDataJSON().receipts) await route.abort();
    else await route.continue();
  });
  await page.goto(surface);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Review updates" }).waitFor();
  assert.match(await dialog.innerText(), /2 updated questions affect/);
  assert.match(await dialog.innerText(), /bookmarks/);
  assert.match(await dialog.innerText(), /California · 2/);
  assert.equal(await page.evaluate(() => document.activeElement.textContent), "Review updates");
  if (process.env.QUESTION_UPDATES_SCREENSHOTS) await page.screenshot({ path: ".tools/editorial-dialog-mobile.png" });
  await dialog.getByRole("button", { name: "Later" }).click();
  await dialog.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: "Question updates", exact: true }).waitFor();
  assert.equal(Boolean((await json(await second.request.get(api))).receipts[eventId]?.shown), false);
  await page.unroute("**/api/question-updates/");
  const delivered = page.waitForResponse(response => response.url().endsWith(api) && response.request().method() === "POST" && response.request().postDataJSON().receipts);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  assert.equal((await delivered).ok(), true);

  const desktop = await second.newPage();
  await desktop.goto(surface);
  await desktop.getByRole("button", { name: "More", exact: true }).click();
  await desktop.getByRole("button", { name: "Question updates", exact: true }).click();
  const desktopDialog = desktop.getByRole("dialog");
  await desktopDialog.getByRole("heading", { name: "Question updates" }).waitFor();
  assert.equal(new URL(desktop.url()).pathname, surface);
  if (process.env.QUESTION_UPDATES_SCREENSHOTS) await desktop.screenshot({ path: ".tools/editorial-updates-desktop.png" });
  await desktopDialog.getByRole("button", { name: /CA-054/ }).click();
  await desktopDialog.getByRole("heading", { name: "Answer and reasoning" }).waitFor();
  assert.equal(new URL(desktop.url()).pathname, surface);
  await desktopDialog.getByRole("button", { name: "Back to updates" }).click();
  await desktop.keyboard.press("Escape");
  await desktopDialog.waitFor({state: "hidden"});
  assert.equal(await desktop.evaluate(() => document.activeElement.textContent), "More");
  const proPage = await pro.newPage();
  for (const width of [320, 390, 1024, 1120, 1440, 1536]) {
    await proPage.setViewportSize({width, height: 880});
    await proPage.goto("/arizona/");
    await proPage.locator(".avatar-pro .avatar-art").waitFor();
    const header = await proPage.locator(".header-inner").evaluate(inner => {
      const scroll = inner.querySelector(".nav-scroll");
      const more = inner.querySelector(".more-btn");
      const right = inner.querySelector(".header-right");
      return {
        fits: scroll.getBoundingClientRect().right <= more.getBoundingClientRect().left &&
          right.getBoundingClientRect().right <= inner.getBoundingClientRect().right + 1 &&
          (scroll.scrollWidth <= scroll.clientWidth || getComputedStyle(scroll).overflowX === "auto"),
        crown: inner.querySelector(".avatar-pro .avatar-art").getAttribute("src"),
        initial: inner.querySelector(".avatar-pro").textContent.trim(),
      };
    });
    assert.ok(header.fits, `Header controls overlap at ${width}px`);
    assert.match(header.crown, /pro-crown\.webp$/);
    assert.match(header.initial, /\p{L}/u);
    await proPage.waitForFunction(() => document.querySelector(".avatar-pro .avatar-art")?.naturalWidth > 0);
  }
  if (process.env.QUESTION_UPDATES_SCREENSHOTS) await proPage.locator(".site-header").screenshot({ path: ".tools/crown-header-desktop.png" });
  await proPage.route("**/api/auth/me/", async route => {
    const response = await route.fetch();
    const session = await response.json();
    await route.fulfill({ response, json: { ...session, user: { ...session.user, lifetimePro: true } } });
  });
  await proPage.reload();
  await proPage.waitForFunction(() => document.querySelector(".avatar-lifetime .avatar-art")?.naturalWidth > 0);
  assert.match(await proPage.locator(".avatar-lifetime .avatar-art").getAttribute("src"), /lifetime-crown\.webp$/);
  assert.equal(await proPage.locator(".avatar-lifetime span").innerText(), "P");
  if (process.env.QUESTION_UPDATES_SCREENSHOTS) await proPage.locator(".site-header").screenshot({ path: ".tools/lifetime-crown-header.png" });
  await proPage.goto("/question-updates/ri-184-v2/");
  await proPage.getByRole("dialog").getByRole("heading", { name: "Answer and reasoning" }).waitFor();
  assert.equal(new URL(proPage.url()).pathname, "/");
  const after = await json(await second.request.get(api));
  assert.equal(after.receipts[eventId].shown, true);
  assert.equal(after.receipts[eventId].read, true);
  const saved = await json(await second.request.get("/api/mistakes/?state=CA"));
  assert.equal(saved.favorites.some(stat => stat.questionId === "ca-054"), true);
  const masteredVersion = await json(await answer("ca-054", 2, "C", "edit-new-ca054"));
  assert.equal(masteredVersion.stat.rightCount, 1);
  assert.equal(masteredVersion.stat.questionVersion, 2);
  const retry = await json(await answer("ca-054", 1, "A", "edit-old-ca054"));
  assert.deepEqual(retry.stat, masteredVersion.stat);
  const progress = await json(await first.request.get("/api/progress/?state=CA"));
  assert.deepEqual(progress.stats.find(row => row.questionId === "ca-054"), masteredVersion.stat);

  const clean = await unaffected.newPage();
  await clean.goto(surface);
  assert.deepEqual((await json(await unaffected.request.get(api))).updates, []);
  assert.equal(await clean.getByRole("dialog").count(), 0);
  await json(await unaffected.request.post("/api/progress/", { data: { state: "CA", questionId: "ca-054",
    questionVersion: 1, selected: "A", attemptId: "safe-point-old-ca054" } }));
  await clean.goto("/california/practice/?mode=quick");
  const quiz = clean.locator("[data-editorial-quiz-active]");
  await quiz.waitFor();
  assert.equal(await clean.getByRole("dialog").count(), 0, "An active sitting must stay unobstructed");
  await clean.locator(".q-jump button").last().click();
  await clean.getByRole("group", { name: "Answer choices" }).getByRole("button").first().click();
  await clean.getByRole("button", { name: "See results" }).click();
  const endConfirmation = clean.getByRole("dialog", { name: "Submit with unanswered questions?" });
  if (await endConfirmation.count()) await endConfirmation.getByRole("button", { name: "Submit anyway" }).click();
  await quiz.waitFor({ state: "hidden" });
  await clean.getByRole("dialog", { name: /updated/ }).waitFor();
  await clean.keyboard.press("Escape");
  await clean.getByRole("dialog", { name: /updated/ }).waitFor({ state: "hidden" });

  const guest = await browser.newContext({ baseURL: base.href });
  const guestPage = await guest.newPage();
  await guestPage.goto("/pricing/");
  await guestPage.evaluate(() => {
    localStorage.setItem("ca-notary-progress", JSON.stringify({
      flaggedIds: ["ca-054"], answeredIds: ["ca-054"], wrongIds: ["ca-054"], questionVersions: { "ca-054": 1 },
    }));
  });
  await guestPage.goto(surface);
  const guestDialog = guestPage.getByRole("dialog", { name: /updated/ });
  await guestDialog.getByRole("button", { name: "Later" }).waitFor();
  assert.match(await guestDialog.innerText(), /flags/);
  await guestDialog.getByRole("button", { name: "Later" }).click();
  await login(guest, "free-http");
  const merged = guestPage.waitForResponse(response => response.url().endsWith(api) && response.request().method() === "POST" &&
    response.request().postDataJSON().receipts);
  await guestPage.reload();
  assert.equal((await merged).ok(), true);
  assert.equal((await json(await guest.request.get(api))).receipts[eventId].shown, true);
  assert.equal(await guestDialog.count(), 0);
  console.log("Local mobile and desktop: old answers, bookmarks, Pro visibility, bundled notification, Later, offline retry, cross-device deduplication, account targeting, quiz safe point, and guest-to-account receipt transfer passed.");
} finally {
  await browser?.close();
  server?.kill();
}
