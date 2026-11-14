import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { testLoader } from './pack-test-utils.mjs';
import { browserRequest } from './browser-request.mjs';

const base = process.env.FULL_STATE_BASE;
assert.ok(base && process.env.STATE17_ACCOUNT_FILE);
const accounts = JSON.parse(fs.readFileSync(process.env.STATE17_ACCOUNT_FILE, 'utf8'));
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { freeStateCatalog } = load('lib/free-state-catalog.ts');
const { serverStateQuestions } = load('data/full-state-server.ts');
const { shuffle } = load('lib/answer-sequence.ts');
const codes = process.env.FULL_STATE_VERIFY_CODES?.split(',') || freeStateCatalog.map(([code]) => code);
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const rows = [];
try {
  for (const [kind, width] of [['free', 1440], ['expired', 390]]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
    const page = await context.newPage();
    await page.goto(base + '/');
    assert.equal((await browserRequest(page, base + '/api/auth/login/', { data: accounts[kind] })).status(), 200);
    for (const code of codes) {
      const pack = packFor(code);
      const before = (await (await browserRequest(page, base + '/api/auth/me/')).json()).user;
      const used = before.packFullExamCount[code];
      assert.equal(typeof used, 'number', `${code} account count is present`);
      const bank = (await (await browserRequest(page, `${base}/api/state/questions/?state=${code}`)).json()).questions;
      assert.equal(bank.length, 60);
      const paid = serverStateQuestions(code).find(question => !question.is_free);
      assert.equal((await browserRequest(page, base + '/api/progress/', { data: {
        state: code, questionId: paid.question_id, questionVersion: paid.version,
        selected: paid.correct_option, attemptId: randomUUID(),
      } })).status(), 402);
      const seed = 528;
      const sitting = { kind: 'pack-full', state: code, seed, examId: randomUUID(),
        questions: shuffle(bank, seed).slice(0, 40).map((question, index) => ({
          questionId: question.question_id, questionVersion: question.version,
          selected: index < 4 ? ['A', 'B', 'C', 'D'].find(letter => letter !== question.correct_option) : question.correct_option,
          attemptId: randomUUID(),
        })),
      };
      if (used === 0) {
        const responses = await Promise.all([1, 2].map(() => browserRequest(page, base + '/api/progress/', { data: sitting })));
        assert.ok(responses.every(response => response.status() === 200), `${code} free full trial`);
        const results = await Promise.all(responses.map(response => response.json()));
        assert.equal(results.filter(result => result.duplicate).length, 1);
        assert.ok(results.every(result => result.exam.correctCount === 36));
        sitting.examId = randomUUID();
      }
      assert.equal((await browserRequest(page, base + '/api/progress/', { data: sitting })).status(), 402, `${code} trial limit`);
      const after = (await (await browserRequest(page, base + '/api/auth/me/')).json()).user;
      assert.equal(after.packFullExamCount[code], Math.max(1, used));
      await page.goto(base + pack.paths.practice);
      const full = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Comprehensive Practice', exact: true }) });
      await full.getByRole('button', { name: 'Start', exact: true }).click();
      await page.getByRole('heading', { name: 'Free Comprehensive Practice already used', exact: true }).waitFor({ timeout: 45000 });
      await page.getByRole('link', { name: 'Unlock Pro', exact: true }).waitFor();
      rows.push({ code, kind, width, bank: 60, fullTrialCount: after.packFullExamCount[code], trialCreated: used === 0, paidAnswerDenied: true, limitAndUi: true });
      console.log(JSON.stringify(rows.at(-1)));
      fs.writeFileSync(`.tools/full-state-${process.env.FULL_STATE_STAGE || 'account'}-account.json`, JSON.stringify({ base, rows }, null, 2));
    }
    await browserRequest(page, base + '/api/auth/logout/', { data: {} });
    await context.close();
  }
} finally {
  await browser.close();
}
