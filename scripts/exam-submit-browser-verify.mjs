import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const base = process.env.EXAM_VERIFY_BASE;
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):/);
const playwright = process.env.EXAM_VERIFY_PLAYWRIGHT ?? ".tools/browser/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(path.resolve(playwright)));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const sittingKey = (mode) => `az-sitting:AZ:guest:${mode}`;
const button = (page, name) => page.getByRole("button", { name, exact: true });
const result = (page) => page.locator(".result-summary");
const confirmation = (page) => page.getByRole("dialog", { name: "Submit with unanswered questions?" });

async function openSitting(mode, { index = 0, answers = {}, status = 200, compact = false, useClock = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const key = sittingKey(compact ? "home-quick" : mode);
  await context.addInitScript(({ key, index, answers }) => {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, JSON.stringify({
      version: 1, owner: "guest", state: "AZ", mode: key.split(":").at(-1), seed: 45,
      questionIds: ["az-001", "az-002", "az-003"], presentationVersion: 1, idx: index,
      answers, startedAt: Date.now(), timeLimitSeconds: 3600,
    }));
  }, { key, index, answers });
  await context.route("**/api/auth/me/", (route) => route.fulfill({ json: { user: null } }));
  const submissions = [];
  await context.route("**/api/progress/", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      if (payload.kind === "exam" || payload.kind === "pack-full") {
        submissions.push(payload);
        return route.fulfill({ status: submissions.length === 1 ? status : 200, json: { fullExamCount: 1 } });
      }
    }
    return route.fulfill({ json: {} });
  });
  const page = await context.newPage();
  if (useClock) await page.clock.install();
  if (compact) {
    await page.goto(`${base}/arizona/`);
    await button(page, "Continue the 10 questions started on this page").click();
  } else {
    await page.goto(`${base}/arizona-notary-practice-test/?mode=${mode}`);
  }
  await page.locator(".quiz-stem").waitFor();
  return { context, page, submissions };
}

try {
  const full = await openSitting("full", { answers: { "az-001": "B" }, status: 500 });
  const { context, page, submissions } = full;
  await button(page, "3").click();
  await button(page, "Submit exam").click();
  const dialog = confirmation(page);
  await dialog.waitFor({ timeout: 4000 });
  assert.match(await dialog.innerText(), /2 unanswered questions/);
  assert.equal(await button(page, "Return to questions").evaluate((element) => element === document.activeElement), true);
  assert.equal(submissions.length, 0);
  if (process.env.EXAM_VERIFY_SCREENSHOT) await page.screenshot({ path: process.env.EXAM_VERIFY_SCREENSHOT });
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await button(page, "Submit exam").evaluate((element) => element === document.activeElement), true);
  assert.equal(submissions.length, 0);

  await button(page, "Submit exam").click();
  await button(page, "Return to questions").click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await button(page, "Submit exam").evaluate((element) => element === document.activeElement), true);
  await button(page, "2").click();
  await page.getByRole("button", { name: /Arizona Secretary of State/ }).click();
  await button(page, "Next").click();
  await button(page, "Submit exam").click();
  assert.match(await confirmation(page).innerText(), /1 unanswered question\b/);
  await button(page, "Submit anyway").click();
  await button(page, "Try again").waitFor();
  assert.equal(await dialog.count(), 0);
  await button(page, "Try again").click();
  await result(page).waitFor();
  assert.equal(submissions.length, 2);
  assert.equal(submissions[0].examId, submissions[1].examId);
  assert.deepEqual(submissions[1].questions.map((question) => question.selected), ["B", "C", undefined]);
  await page.reload();
  await result(page).waitFor();
  assert.equal(submissions.length, 2);
  await context.close();
  console.log("Full exam: missing middle and last, Escape, focus, return, submit, retry and reload passed.");

  const ready = await openSitting("full", { index: 2, answers: { "az-001": "B", "az-002": "C", "az-003": "A" } });
  await button(ready.page, "Submit exam").click();
  await result(ready.page).waitFor();
  assert.equal(await confirmation(ready.page).count(), 0);
  assert.equal(ready.submissions.length, 1);
  await ready.context.close();
  console.log("Fully answered exam: direct submission passed.");

  const quick = await openSitting("quick", { index: 2, answers: { "az-001": "B" } });
  await button(quick.page, "Previous answer").click();
  await button(quick.page, "Back to this question").click();
  await quick.page.getByRole("button", { name: /A \$5,000 surety bond/ }).click();
  await quick.page.locator(".q-option.correct").waitFor();
  await quick.page.waitForTimeout(500);
  assert.equal(await confirmation(quick.page).count(), 0);
  await button(quick.page, "See results").click();
  await confirmation(quick.page).waitFor();
  assert.match(await confirmation(quick.page).innerText(), /1 unanswered question\b/);
  assert.equal(quick.submissions.length, 0);
  await button(quick.page, "Return to questions").click();
  await button(quick.page, "See results").click();
  await button(quick.page, "Submit anyway").click();
  await result(quick.page).waitFor();
  assert.equal(await result(quick.page).getByRole("heading", { name: "Official sources" }).count(), 0);
  assert.ok(await quick.page.locator(".answer-source a").count());
  assert.equal(quick.submissions.length, 1);
  await quick.context.close();
  console.log("Quick practice: correct feedback stays in place, See results requires an explicit action, and question sources remain.");

  const home = await openSitting("quick", { index: 2, compact: true });
  await button(home.page, "See results").click();
  assert.equal(await confirmation(home.page).count(), 0);
  assert.equal(home.submissions.length, 0);
  await home.page.getByRole("button", { name: /law degree/ }).click();
  await button(home.page, "See results").click();
  assert.match(await confirmation(home.page).innerText(), /2 unanswered questions/);
  await button(home.page, "Submit anyway").click();
  await result(home.page).waitFor();
  assert.equal(home.submissions.length, 1);
  await home.context.close();
  console.log("Homepage Quick 10: the untouched preview stays open and a started sitting warns about blanks.");

  const expires = await openSitting("full", { index: 1, useClock: true });
  await expires.page.getByRole("button", { name: /Arizona Secretary of State/ }).click();
  await button(expires.page, "Next").click();
  await button(expires.page, "Submit exam").click();
  await confirmation(expires.page).waitFor();
  await expires.page.clock.fastForward(3601000);
  await result(expires.page).waitFor();
  await expires.page.clock.fastForward(2000);
  assert.equal(await confirmation(expires.page).count(), 0);
  assert.equal(expires.submissions.length, 1);
  assert.deepEqual(expires.submissions[0].questions.map((question) => question.selected), [undefined, "C", undefined]);
  await expires.context.close();
  console.log("Timer expiry: an open confirmation closes and the exam submits once.");
} finally {
  await browser.close();
}
