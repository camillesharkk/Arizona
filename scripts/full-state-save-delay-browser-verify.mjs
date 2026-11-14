import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';
import { browserRequest } from './browser-request.mjs';

const base = process.env.FULL_STATE_BASE;
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):/);
const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { shuffle } = load('lib/answer-sequence.ts');
const pack = packFor('AR');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext();
  await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
  const page = await context.newPage();
  await page.goto(base + '/');
  assert.equal((await browserRequest(page, base + '/api/auth/login/', { data: {
    email: 'pack-pro-http@example.invalid', password: TEST_PASSWORD,
  } })).status(), 200);
  const bank = (await (await browserRequest(page, base + '/api/state/questions/?state=AR')).json()).questions;
  assert.equal(bank.length, 203);
  const seed = 358;
  const examId = randomUUID();
  const full = { kind: 'pack-full', state: 'AR', seed, examId,
    questions: shuffle(bank, seed).slice(0, 40).map((question, index) => ({
      questionId: question.question_id, questionVersion: question.version, attemptId: randomUUID(),
      selected: index < 4 ? ['A', 'B', 'C', 'D'].find(letter => letter !== question.correct_option) : question.correct_option,
    })),
  };
  assert.equal((await browserRequest(page, base + '/api/progress/', { data: full })).status(), 200);
  let reviewSubmission;
  await page.route('**/api/progress/', async route => {
    if (route.request().method() === 'POST' && route.request().postDataJSON()?.kind === 'exam') {
      reviewSubmission = route.request().postDataJSON();
      await new Promise(resolve => setTimeout(resolve, 25000));
    }
    await route.continue();
  });
  await page.goto(`${base}${pack.paths.mistakes}?attempt=${examId}`);
  await page.getByRole('button', { name: 'Practice wrong answers', exact: true }).click();
  await page.locator('.q-option').first().waitFor();
  for (let index = 0; index < 4; index++) {
    const stem = (await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/, '');
    const question = bank.find(item => item.question_text === stem);
    assert.ok(question);
    const right = question[`option_${question.correct_option.toLowerCase()}`];
    const choices = await page.locator('.q-option').allTextContents();
    const selected = choices.findIndex(text => text.trim().replace(/^[A-D][.)]\s*/, '') === right);
    assert.ok(selected >= 0);
    await page.locator('.q-option').nth(selected).click();
    if (index < 3) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(number => document.querySelector('.quiz-stem')?.textContent?.trim().startsWith(number + '.'), index + 2);
    }
  }
  await page.getByRole('button', { name: 'See results', exact: true }).click();
  try {
    await page.locator('.result-summary').waitFor({ timeout: 35000 });
  } catch (error) {
    const body = await page.locator('body').innerText();
    fs.writeFileSync('.tools/full-state-delay-failure.txt', body);
    throw new Error(body.includes("We couldn't save this exam") ? 'Review failed before its successful delayed save returned' : error.message);
  }
  assert.match(await page.locator('.result-summary').innerText(), /4 of 4 correct/);
  const saved = (await (await browserRequest(page, base + '/api/progress/')).json()).exams;
  assert.equal(saved.filter(exam => exam.id === examId).length, 1);
  assert.equal(saved.find(exam => exam.id === examId).correctCount, 36);
  assert.equal(saved.filter(exam => exam.id === reviewSubmission.examId).length, 1);
  assert.equal(saved.find(exam => exam.id === reviewSubmission.examId).correctCount, 4);
  await page.unroute('**/api/progress/');
  const retry = await browserRequest(page, base + '/api/progress/', { data: reviewSubmission });
  assert.equal(retry.status(), 200);
  assert.equal((await retry.json()).duplicate, true);
  const result = { delayedHistoryMs: 25000, review: '4/4', originalFullPreserved: '36/40', historyRetryIdempotent: true };
  fs.writeFileSync('.tools/full-state-save-delay.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
