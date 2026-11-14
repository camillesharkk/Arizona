import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';
import { browserRequest } from './browser-request.mjs';

const base = process.env.FULL_STATE_BASE || 'http://localhost:35379';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):/, 'Task fixtures run on isolated localhost');
const load = testLoader();
const { freeStateCatalog } = load('lib/free-state-catalog.ts');
const { packFor } = load('lib/prep-pack.ts');
const { serverStateQuestions } = load('data/full-state-server.ts');
const codes = process.env.FULL_STATE_VERIFY_CODES?.split(',') || freeStateCatalog.map(([code]) => code);
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const rows = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
    const page = await context.newPage();
    await page.goto(base + '/');
    const login = await browserRequest(page, base + '/api/auth/login/', { data: {
      email: `pack-pro-${width > 600 ? 'desktop' : 'mobile'}@example.invalid`, password: TEST_PASSWORD,
    } });
    assert.equal(login.status(), 200);
    const zone = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
    for (const code of codes) {
      const pack = packFor(code);
      const [paid, nextPaid] = serverStateQuestions(code).filter(question => !question.is_free);
      const url = `${base}/api/daily-study/?state=${code}&timeZone=${encodeURIComponent(zone)}`;
      const actual = await (await browserRequest(page, url)).json();
      assert.equal(actual.freeOnly, false);
      let fixture = { ...actual, practiceQuestionIds: [paid.question_id], reviewQuestionIds: [],
        taskStatus: [...actual.taskStatus.filter(task => !task.kind.endsWith('question')),
          { key: `question:${paid.question_id}`, kind: 'new-question', status: 'pending' }],
      };
      const changeTask = async route => {
        const request = route.request();
        if (request.method() === 'POST' && request.postDataJSON()?.questionId === paid.question_id) {
          fixture = { ...fixture, practiceQuestionIds: [nextPaid.question_id], taskStatus: [
            ...fixture.taskStatus.filter(task => !task.kind.endsWith('question')),
            { key: `question:${nextPaid.question_id}`, kind: 'new-question', status: 'pending' },
          ] };
        }
        await route.continue();
      };
      await page.route('**/api/progress/', changeTask);
      const tasks = async route => {
        if (route.request().method() === 'GET' && new URL(route.request().url()).searchParams.get('state') === code) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) });
        } else await route.continue();
      };
      await page.route('**/api/daily-study/**', tasks);
      await page.goto(base + pack.paths.daily);
      const quiz = page.locator('.daily-practice-quiz');
      await quiz.locator('.q-option').first().waitFor({ timeout: 45000 });
      assert.equal((await quiz.locator('.quiz-stem').innerText()).replace(/^\d+\.\s*/, ''), paid.question_text);
      const right = paid[`option_${paid.correct_option.toLowerCase()}`];
      const choices = await quiz.locator('.q-option').allTextContents();
      const index = choices.findIndex(text => text.trim().replace(/^[A-D][.)]\s*/, '') === right);
      assert.ok(index >= 0);
      const [saved] = await Promise.all([
        page.waitForResponse(response => new URL(response.url()).pathname === '/api/progress/' && response.request().method() === 'POST'),
        quiz.locator('.q-option').nth(index).click(),
      ]);
      assert.equal(saved.status(), 200);
      assert.equal(saved.request().postDataJSON().questionId, paid.question_id);
      assert.equal(saved.request().postDataJSON().state, code);
      await page.waitForFunction(stem => document.querySelector('.daily-practice-quiz .quiz-stem')?.textContent?.includes(stem), nextPaid.question_text);
      assert.equal(await quiz.locator('.q-option.selected').count(), 0);
      await page.unroute('**/api/progress/', changeTask);
      await page.unroute('**/api/daily-study/**', tasks);
      await page.goto(base + pack.paths.daily);
      const [marked] = await Promise.all([
        page.waitForResponse(response => new URL(response.url()).pathname === '/api/daily-study/' && response.request().method() === 'POST' && response.request().postDataJSON().action === 'studied'),
        page.getByRole('button', { name: 'Mark studied', exact: true }).click(),
      ]);
      assert.equal(marked.status(), 200);
      const card = marked.request().postDataJSON().cardId;
      const after = await (await browserRequest(page, url)).json();
      assert.ok(!after.taskStatus.some(task => task.key === `card:${card}` && task.status === 'pending'));
      rows.push({ code, width, paidTaskFixture: true, realPaidAnswer: true, nextTask: true, realCardProgress: true });
      console.log(JSON.stringify(rows.at(-1)));
    }
    await browserRequest(page, base + '/api/auth/logout/', { data: {} });
    await context.close();
  }
  fs.writeFileSync('.tools/full-state-daily-paid.json', JSON.stringify({ base, rows }, null, 2));
} finally {
  await browser.close();
}
