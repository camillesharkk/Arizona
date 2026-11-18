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
const empty = await createUser("empty");
const returning = await createUser("returning");
await store.updateUser(returning.id, { createdAt: past });
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
  const newLearner = await browser.newContext({ viewport: { width: 320, height: 840 }, timezoneId: "America/Phoenix" });
  const returningLearner = await browser.newContext({ viewport: { width: 390, height: 840 }, timezoneId: "America/Phoenix" });
  const guideUrl = `${base}/api/daily-study/guide/`;
  assert.equal((await returningLearner.request.post(guideUrl)).status(), 401);
  for (const [context, account] of [[desktop, main], [mobile, other], [newLearner, empty], [returningLearner, returning]]) {
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

  const returningPage = await returningLearner.newPage();
  const returningClaim = returningPage.waitForResponse(guideUrl);
  await returningPage.goto(`${base}/california/daily-study/`);
  const returningButton = returningPage.getByRole("button", { name: "Daily Study guide", exact: true });
  const returningGuide = returningPage.getByRole("dialog", { name: "Daily Study guide" });
  await returningButton.waitFor();
  assert.deepEqual(await (await returningClaim).json(), { show: false });
  await assert.rejects(returningGuide.waitFor({ timeout: 450 }), { name: "TimeoutError" },
    "An existing account in a fresh browser must not get the automatic guide");
  await returningButton.click();
  await returningGuide.getByText("Step 1 of 4").waitFor();
  await returningGuide.getByRole("button", { name: "Skip guide" }).click();
  await returningGuide.waitFor({ state: "hidden" });

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
  assert.equal(await page.getByRole("link", { name: "Explore Community Insights" }).getAttribute("href"), "/community-insights/");

  const missed = page.getByRole("region", { name: "Missed questions across the site" });
  const schedule = page.getByRole("region", { name: "Scheduled review" });
  const tiles = missed.locator(".daily-state-tile");
  assert.equal(await tiles.count(), 3);
  const widths = await tiles.evaluateAll(items => items.map(item => item.getBoundingClientRect().width));
  assert.ok(widths[0] > widths[1] && widths[1] > widths[2], "State circles scale with actual counts");
  assert.equal(await schedule.locator("select option").count(), 17);
  const current = schedule.getByRole("heading", { level: 3 });
  assert.equal(await current.textContent(), before.scheduled[0].prompt);
  await schedule.getByRole("button", { name: "Next review item" }).click();
  assert.equal(await current.textContent(), before.scheduled[1].prompt);
  await schedule.getByRole("button", { name: "Show review item 4 of 17" }).click();
  assert.equal(await current.textContent(), before.scheduled[3].prompt);
  await schedule.getByRole("combobox", { name: "Review item" }).selectOption("15");
  assert.equal(await current.textContent(), before.scheduled[15].prompt);
  await schedule.getByText(/^Next /).waitFor();
  await schedule.getByRole("button", { name: "Next review item" }).click();
  await schedule.getByText("Mastered", { exact: true }).waitFor();
  assert.equal(await schedule.getByRole("button", { name: "Next review item" }).getAttribute("aria-disabled"), "true");
  await schedule.getByRole("combobox", { name: "Review item" }).selectOption("0");
  if (process.env.DAILY_GALLERY_SCREENSHOT_DIR) {
    for (const [section, name] of [[missed, "missed-desktop"], [schedule, "scheduled-desktop"]]) {
      await section.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
      await section.locator("img").evaluateAll(images => Promise.all(images.map(img => img.decode())));
      await section.screenshot({ path: path.join(process.env.DAILY_GALLERY_SCREENSHOT_DIR, `${name}.png`) });
    }
  }

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
  // Leaving before finishing or skipping still counts as the first showing.
  const reloadClaim = small.waitForResponse(guideUrl);
  await small.reload();
  await small.getByText("1 question missed on your account.").waitFor();
  assert.deepEqual(await (await reloadClaim).json(), { show: false });
  await assert.rejects(smallGuide.waitFor({ timeout: 450 }), { name: "TimeoutError" });
  await small.getByRole("button", { name: "Daily Study guide" }).click();
  await smallGuide.getByText("Step 1 of 4").waitFor();
  await small.keyboard.press("Escape");
  await smallGuide.waitFor({ state: "hidden" });
  const newBrowser = await browser.newContext({ viewport: { width: 390, height: 840 } });
  await newBrowser.route("https://**/*", route => route.abort());
  await newBrowser.addCookies(await mobile.cookies());
  const revisit = await newBrowser.newPage();
  const revisitClaim = revisit.waitForResponse(guideUrl);
  await revisit.goto(`${base}/new-york/daily-study/`);
  await revisit.getByRole("button", { name: "Daily Study guide", exact: true }).waitFor();
  assert.deepEqual(await (await revisitClaim).json(), { show: false });
  await assert.rejects(revisit.getByRole("dialog", { name: "Daily Study guide" }).waitFor({ timeout: 450 }), { name: "TimeoutError" },
    "The account-wide receipt applies in a fresh browser and another state");
  await newBrowser.close();
  const smallMissed = small.getByRole("region", { name: "Missed questions across the site" });
  assert.equal(await smallMissed.locator(".daily-state-tile").count(), 4);
  assert.equal(await smallMissed.getByRole("link", { name: "Arizona (0 missed)" }).count(), 1);
  const smallSchedule = small.getByRole("region", { name: "Scheduled review" });
  assert.equal(await smallSchedule.getByRole("button").count(), 0);
  assert.ok(await small.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  if (process.env.DAILY_GALLERY_SCREENSHOT_DIR) {
    for (const [section, name] of [[smallMissed, "missed-mobile"], [smallSchedule, "scheduled-mobile"]]) {
      await section.evaluate(element => element.scrollIntoView({ block: "center", behavior: "instant" }));
      await section.locator("img:visible").evaluateAll(images => Promise.all(images.map(img => img.decode())));
      await section.screenshot({ path: path.join(process.env.DAILY_GALLERY_SCREENSHOT_DIR, `${name}.png`) });
    }
  }

  const blank = await newLearner.newPage();
  await blank.goto(`${base}/california/daily-study/`);
  await blank.getByRole("button", { name: "Skip guide" }).click();
  await blank.getByText("0 questions missed on your account.").waitFor();
  await blank.getByRole("heading", { name: "No reviews scheduled yet" }).waitFor();
  assert.equal(await blank.getByRole("region", { name: "Scheduled review" }).getByRole("button").count(), 0);
  assert.equal(await blank.locator(".daily-state-tile").count(), 4);
  assert.ok(await blank.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const parallel = await createUser("parallel");
  const concurrent = await browser.newContext();
  const login = await concurrent.request.post(`${base}/api/auth/login/`, { data: { email: parallel.email, password: TEST_PASSWORD } });
  assert.equal(login.status(), 200);
  const receipts = await Promise.all(Array.from({ length: 3 }, () => concurrent.request.post(guideUrl)));
  assert.ok(receipts.every(response => response.ok()));
  const claimed = await Promise.all(receipts.map(response => response.json()));
  assert.equal(claimed.filter(item => item.show).length, 1, "Only one simultaneous visit may claim the guide");
  await concurrent.close();
  console.log("Daily Study guide verified: existing accounts are manual-only, new accounts get one showing across refresh, states, browsers and concurrent visits.");

  // Exercise the full-width composition with the eight-state distribution from the layout report.
  const mosaic = await desktop.newPage();
  const mosaicStates = [["CA", 28], ["NY", 10], ["CO", 9], ["WY", 9], ["AZ", 8], ["NE", 8], ["HI", 7], ["PA", 6]];
  await mosaic.route(/\/api\/daily-study\/\?/, route => {
    if (route.request().method() !== "GET") return route.continue();
    return route.fulfill({ json: {
      ...before,
      wrongQuestionCount: 85,
      wrongQuestionsByState: mosaicStates.map(([state, count]) => ({ state, count, available: true })),
    } });
  });
  for (const [width, height] of [[1440, 900], [390, 840], [320, 700]]) {
    await mosaic.setViewportSize({ width, height });
    await mosaic.goto(`${base}/california/daily-study/`);
    const gallery = mosaic.getByRole("region", { name: "Missed questions across the site" });
    await gallery.getByText("85 questions missed on your account.").waitFor();
    const box = await gallery.boundingBox();
    assert.ok(box.width >= width - 44, "Gallery spans almost the full viewport");
    assert.ok(box.height >= height - (width <= 640 ? 101 : 69), "Gallery fills the viewport below the header");
    assert.ok(await mosaic.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Page must not scroll horizontally");
    const circles = gallery.locator(".daily-state-tile");
    assert.equal(await circles.count(), mosaicStates.length);
    const diameters = await circles.evaluateAll(items => items.map(item => item.getBoundingClientRect().width).sort((a, b) => b - a));
    assert.ok(diameters[0] / diameters[1] >= (width > 640 ? 2.3 : 1.6), "The leading circle is visibly larger");
    const stack = await gallery.locator(".daily-state-compact").evaluateAll(items => items.map(item => {
      const box = item.getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }));
    assert.ok(stack.some((point, index) => stack.slice(index + 1).some(other => Math.abs(other.x - point.x) < 2 && Math.abs(other.y - point.y) > 45)));
    const rail = gallery.getByRole("list", { name: "Missed questions by state" });
    if (width <= 640) {
      await mosaic.waitForFunction(() => {
        const track = document.querySelector(".daily-state-rail");
        const lead = track.querySelector('[aria-current="true"]').getBoundingClientRect();
        const rect = track.getBoundingClientRect();
        return track.scrollWidth > track.clientWidth && Math.abs(lead.x + lead.width / 2 - (rect.x + rect.width / 2)) < 3;
      }, null, { timeout: 3000 });
      await rail.focus();
      const start = await rail.evaluate(element => element.scrollLeft);
      await mosaic.keyboard.press("ArrowRight");
      await mosaic.waitForFunction(before => document.querySelector(".daily-state-rail").scrollLeft !== before, start, { timeout: 3000 });
      await rail.evaluate(el => el.blur());
      await mosaic.reload();
      await gallery.getByText("85 questions missed on your account.").waitFor();
    }
    if (process.env.DAILY_GALLERY_SCREENSHOT_DIR && width !== 320) {
      await gallery.scrollIntoViewIfNeeded();
      await circles.locator("img").evaluateAll(images => images.forEach(img => { img.loading = "eager"; }));
      await mosaic.waitForFunction(() => Array.from(document.querySelectorAll(".daily-state-rail img")).every(img => img.complete && img.naturalWidth > 0), null, { timeout: 5000 });
      await gallery.screenshot({
        path: path.join(process.env.DAILY_GALLERY_SCREENSHOT_DIR, `missed-mosaic-${width}.png`),
        style: ".site-header { visibility: hidden; }",
      });
    }
  }
  await mosaic.close();
  console.log("Eight-state Daily Study mosaic verified at 1440px, 390px and 320px: viewport scale, strong size contrast, stacked circles, and a keyboard-scrollable mobile rail.");
  console.log("Daily Study browser verification passed: 30 missed questions, circle sizing and state links, due/future/mastered items, thumbnail and picker navigation, review writes, and zero/one-miss mobile layouts.");
} finally {
  await browser.close();
}
