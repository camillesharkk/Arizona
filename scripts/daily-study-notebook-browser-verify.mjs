import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { testLoader, TEST_PASSWORD } from "./pack-test-utils.mjs";

const base = process.env.DAILY_VERIFY_BASE;
assert.ok(/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(base ?? ""), "Use a localhost test server");
assert.ok(path.resolve(process.env.NOTARY_DATA_DIR || ".").startsWith(path.resolve(".tools") + path.sep), "Use an isolated file store");
assert.ok(!process.env.DATABASE_URL);
const load = testLoader();
const { fileStore: store } = load("lib/store/file-store.ts");
const { hashSync } = createRequire(import.meta.url)("bcryptjs");
const { chromium } = await import(pathToFileURL(path.resolve(
  process.env.DAILY_VERIFY_PLAYWRIGHT || ".tools/browser/node_modules/playwright/index.mjs",
)));
const now = new Date().toISOString();

async function login(context) {
  const email = `notebook-${randomUUID()}@example.invalid`;
  const user = await store.createUser({ email, passwordHash: hashSync(TEST_PASSWORD, 4), name: "Notebook test" });
  await store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: now });
  const result = await context.request.post(`${base}/api/auth/login/`, { data: { email, password: TEST_PASSWORD } });
  assert.equal(result.status(), 200);
  // The unrelated site update modal is verified in its own browser test.
  await context.addInitScript(id => localStorage.setItem(`notary-site-update:2026-11-18-announcements-and-exam-review:${id}`, "seen"), user.id);
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newContext({ viewport: { width: 390, height: 840 } });
  for (const context of [desktop, mobile]) await context.route("https://**/*", route => route.abort());
  await login(desktop);
  const page = await desktop.newPage();
  const azQuestions = `${base}/arizona-notary-exam-questions/`;
  await page.goto(azQuestions);
  const add = page.getByRole("button", { name: "Add to Daily Study", exact: true }).first();
  const dialog = page.getByRole("dialog", { name: "Also add to Wrong Answers?" });
  await add.click();
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), "Daily Study only");
  const primary = dialog.getByRole("button", { name: "Add to both" });
  const colors = await primary.evaluate(node => {
    const style = getComputedStyle(node);
    return [style.color, style.backgroundColor];
  });
  assert.notEqual(colors[0], colors[1], "The primary action retains contrasting colors inside quiz cards");
  if (process.env.DAILY_VERIFY_SCREENSHOT) await page.screenshot({ path: process.env.DAILY_VERIFY_SCREENSHOT });
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await add.evaluate(node => node === document.activeElement), true);
  const notebook = async (context, state) => (await context.request.get(`${base}/api/mistakes/?state=${state}`)).json();
  assert.deepEqual((await notebook(desktop, "AZ")).savedReviewIds, []);

  async function choose(target, choice, status = 200) {
    const result = target.waitForResponse(response =>
      response.url().endsWith("/api/mistakes/") && response.request().method() === "POST");
    await target.getByRole("dialog", { name: "Also add to Wrong Answers?" }).getByRole("button", { name: choice }).click();
    const response = await result;
    assert.equal(response.status(), status);
    return { request: response.request().postDataJSON(), data: await response.json() };
  }

  await add.click();
  const only = await choose(page, "Daily Study only");
  assert.equal(only.request.includeNotebook, false);
  assert.equal(only.data.savedInNotebook, false);
  const az = await notebook(desktop, "AZ");
  assert.deepEqual(az.savedReviewIds, [only.request.questionId]);
  assert.deepEqual(az.mistakes, []);
  const daily = await (await desktop.request.get(`${base}/api/daily-study/?state=AZ`)).json();
  assert.equal(daily.scheduled[0].questionId, only.request.questionId);
  assert.equal(daily.scheduled[0].wrongCount, 0);
  await page.reload();
  await page.getByRole("button", { name: "Added to Daily Study", exact: true }).first().waitFor();

  // A later genuine wrong answer still belongs in the notebook's Incorrect tab.
  const question = load("data/questions.ts").publishedQuestions().find(row => row.question_id === only.request.questionId);
  const selected = ["A", "B", "C"].find(letter => letter !== question.correct_option);
  const missed = await desktop.request.post(`${base}/api/progress/`, { data: {
    questionId: question.question_id, state: "AZ", selected, attemptId: randomUUID(),
  } });
  assert.equal(missed.status(), 200);
  const recorded = (await notebook(desktop, "AZ")).mistakes[0];
  assert.equal(recorded.wrongCount, 1);
  assert.equal(recorded.dailyStudyOnly, true);
  await page.goto(`${base}/wrong-answers/`);
  await page.getByRole("heading", { name: question.question_text, exact: true }).waitFor();
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  await page.getByRole("heading", { name: question.question_text, exact: true }).waitFor({ state: "hidden" });
  await page.getByLabel("Review source").getByRole("button", { name: "All", exact: true }).click();
  const row = page.locator("article").filter({ has: page.getByRole("heading", { name: question.question_text, exact: true }) });
  await row.getByRole("button", { name: "Added to Daily Study", exact: true }).click();
  await row.getByRole("button", { name: "Add to Daily Study", exact: true }).click();
  assert.equal((await choose(page, "Add to both")).data.savedInNotebook, true);
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  await row.getByRole("heading", { name: question.question_text, exact: true }).waitFor();
  assert.equal((await notebook(desktop, "AZ")).mistakes[0].wrongCount, 1);

  await page.goto(`${base}/california/practice/?mode=quick`);
  await add.click();
  const both = await choose(page, "Add to both");
  assert.equal(both.request.includeNotebook, true);
  assert.equal(both.data.savedInNotebook, true);
  const ca = (await notebook(desktop, "CA")).mistakes.find(row => row.questionId === both.request.questionId);
  assert.equal(ca.wrongCount, 0);
  assert.equal(ca.dailyStudyOnly, false);

  const guest = await mobile.newPage();
  await guest.goto(`${base}/new-york/practice/?mode=quick`);
  await guest.getByRole("button", { name: "Add to Daily Study", exact: true }).click();
  const mobileDialog = guest.getByRole("dialog", { name: "Also add to Wrong Answers?" });
  const bounds = await mobileDialog.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
  if (process.env.DAILY_VERIFY_MOBILE_SCREENSHOT) await guest.screenshot({ path: process.env.DAILY_VERIFY_MOBILE_SCREENSHOT });
  const pending = await choose(guest, "Daily Study only", 401);
  await guest.getByText("Sign in to save this question for review.").waitFor();
  await login(mobile);
  const restored = guest.waitForResponse(response =>
    response.url().endsWith("/api/mistakes/") && response.request().method() === "POST");
  await guest.reload();
  assert.equal((await restored).status(), 200);
  const ny = await notebook(mobile, "NY");
  assert.deepEqual(ny.savedReviewIds, [pending.request.questionId]);
  assert.deepEqual(ny.mistakes, []);
  assert.deepEqual((await notebook(desktop, "NY")).savedReviewIds, []);
  console.log("Daily Study save choices passed in Arizona Questions, California practice and New York mobile, including cancel, both outcomes, persistence, genuine mistakes and guest sign-in.");
} finally {
  await browser.close();
}
