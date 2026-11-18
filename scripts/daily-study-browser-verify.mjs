import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { testLoader, TEST_PASSWORD } from "./pack-test-utils.mjs";

const base = process.env.DAILY_VERIFY_BASE;
assert.ok(/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(base ?? ""), "Use a localhost test server");
const data = path.resolve(process.env.NOTARY_DATA_DIR || ".");
assert.ok(data.startsWith(path.resolve(".tools") + path.sep), "Use an isolated file store under .tools");
assert.ok(!process.env.DATABASE_URL, "Use the isolated file store");

const load = testLoader();
const { fileStore: store } = load("lib/store/file-store.ts");
const { currentQuestionVersion } = load("lib/question-revisions.ts");
const { hashSync } = createRequire(import.meta.url)("bcryptjs");
const { chromium } = await import(pathToFileURL(path.resolve(
  process.env.DAILY_VERIFY_PLAYWRIGHT || ".tools/browser/node_modules/playwright/index.mjs",
)));
const day = 86_400_000;
const past = new Date(Date.now() - day * 4).toISOString();
const due = new Date(Date.now() - day * 3).toISOString();
const future = new Date(Date.now() + day * 4).toISOString();
const label = randomUUID();

async function createUser(suffix) {
  const email = `daily-${label}-${suffix}@example.invalid`;
  const user = await store.createUser({ email, passwordHash: hashSync(TEST_PASSWORD, 4), name: "Daily Study test" });
  await store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: past });
  return user;
}

async function saveMiss(user, question, details = {}) {
  await store.upsertStat({
    userId: user.id, questionId: question.question_id, questionVersion: currentQuestionVersion(question.question_id),
    state: question.state, bank: "test", topic: question.topic, chapter: question.topic,
    firstAt: past, lastAt: past, firstCorrect: false, lastCorrect: false,
    wrongCount: 1, rightCount: 0, reviewCount: 0, consecutiveCorrect: 0, reviewStage: 0, lastWrongAt: past,
    lastReviewedAt: null, nextReviewAt: due, reviewPlan: "v2", mastered: false, favorited: false,
    lastSelected: "A", lastCorrectOption: question.correct_option, ...details,
  });
}

const main = await createUser("main");
const other = await createUser("other");
const ca = load("data/ca-questions.ts").publishedCaQuestions();
const ny = load("data/ny-content.ts").publishedNyQuestions().filter(q => q.is_free);
const az = load("data/questions.ts").publishedQuestions().find(q => !q.is_free);
const caDue = ca.slice(0, 15);
for (const question of caDue) await saveMiss(main, question);
await saveMiss(main, ca[15], { nextReviewAt: future });
await saveMiss(main, ca[16], { mastered: true, nextReviewAt: null });
const revised = ny.find(question => currentQuestionVersion(question.question_id) > 1);
assert.ok(revised);
const nyDue = ny.filter(question => question !== revised).slice(0, 11);
for (const question of nyDue) await saveMiss(main, question, { nextReviewAt: null });
await saveMiss(main, revised, { questionVersion: 1, nextReviewAt: null });
await saveMiss(main, az);
await saveMiss(other, ca[17]);

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: "America/Phoenix" });
  const mobile = await browser.newContext({ viewport: { width: 390, height: 840 }, timezoneId: "America/Phoenix" });
  for (const [context, account] of [[desktop, main], [mobile, other]]) {
    await context.route("https://**/*", route => route.abort());
    const login = await context.request.post(`${base}/api/auth/login/`, { data: { email: account.email, password: TEST_PASSWORD } });
    assert.equal(login.status(), 200);
  }

  async function getDaily(context, state) {
    const response = await context.request.get(`${base}/api/daily-study/?state=${state}&timeZone=America%2FPhoenix`);
    assert.equal(response.status(), 200);
    return response.json();
  }

  const before = await getDaily(desktop, "CA");
  assert.equal(before.wrongQuestionCount, 30);
  assert.equal(before.scheduled.length, 17);
  assert.equal(before.due.length, 15);
  assert.equal((await getDaily(desktop, "AZ")).scheduled[0].prompt, null, "Locked question text must stay private");
  assert.equal((await getDaily(mobile, "CA")).wrongQuestionCount, 1);
  const nyPlan = await getDaily(desktop, "NY");
  assert.equal(nyPlan.due.length, 12, "Older mistakes without dates go into review");
  assert.ok(nyPlan.reviewQuestionIds.includes(revised.question_id), "A revised question is still eligible for review");

  const page = await desktop.newPage();
  await page.goto(`${base}/california/daily-study/`);
  const guide = page.getByRole("dialog", { name: "Daily Study guide" });
  await guide.getByText("Step 1 of 4").waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), "Next");
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await guide.getByRole("heading", { name: "Find all your missed questions" }).waitFor();
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await guide.getByText(/Spaced repetition is inspired by the forgetting curve/).waitFor();
  if (process.env.DAILY_VERIFY_SCREENSHOT) await page.screenshot({ path: process.env.DAILY_VERIFY_SCREENSHOT });
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await guide.getByRole("button", { name: "Finish guide" }).click();
  await guide.waitFor({ state: "hidden" });
  const review = page.locator(".daily-review-quiz");
  await review.getByText("1 / 15", { exact: true }).waitFor();
  const prompt = (await review.locator(".quiz-stem").innerText()).replace(/^\d+\.\s*/, "");
  const question = ca.find(item => item.question_text === prompt);
  assert.ok(question);
  const options = await review.locator(".q-option").allTextContents();
  const correct = question[`option_${question.correct_option.toLowerCase()}`];
  const wrong = options.findIndex(option => !option.trim().endsWith(correct));
  assert.ok(wrong >= 0);
  const recorded = page.waitForResponse(response => response.url().endsWith("/api/progress/") && response.request().method() === "POST");
  await review.locator(".q-option").nth(wrong).click();
  assert.equal((await recorded).status(), 200);
  const after = await getDaily(desktop, "CA");
  const retried = after.scheduled.find(item => item.questionId === question.question_id);
  assert.equal(retried.wrongCount, 2);
  assert.ok(Date.parse(retried.nextReviewAt) > Date.now());
  assert.equal(after.taskStatus.find(task => task.key === `question:${question.question_id}`).status, "done");

  await page.getByRole("link", { name: "New York (12)" }).click();
  await page.locator(".daily-review-quiz").getByText("1 / 12", { exact: true }).waitFor();
  assert.equal(await guide.count(), 0, "Completing the guide applies across states");
  await page.reload();
  await page.locator(".daily-review-quiz").getByText("1 / 12", { exact: true }).waitFor();
  assert.equal(await guide.count(), 0);

  const small = await mobile.newPage();
  await small.goto(`${base}/california/daily-study/`);
  const smallGuide = small.getByRole("dialog", { name: "Daily Study guide" });
  await smallGuide.getByRole("button", { name: "Skip guide" }).waitFor();
  const rect = await smallGuide.boundingBox();
  assert.ok(rect.x >= 0 && rect.x + rect.width <= 390);
  if (process.env.DAILY_VERIFY_MOBILE_SCREENSHOT) await small.screenshot({ path: process.env.DAILY_VERIFY_MOBILE_SCREENSHOT });
  await smallGuide.getByRole("button", { name: "Skip guide" }).click();
  await small.reload();
  await small.getByText("1 question missed on your account.").waitFor();
  assert.equal(await smallGuide.count(), 0);
  await small.getByRole("button", { name: "Daily Study guide" }).click();
  await smallGuide.getByText("Step 1 of 4").waitFor();
  await small.keyboard.press("Escape");
  await smallGuide.waitFor({ state: "hidden" });
  console.log("Daily Study browser verification passed: 30 missed questions across three states, full 15- and 12-question queues, account isolation, rescheduling, and desktop/mobile guide.");
} finally {
  await browser.close();
}
