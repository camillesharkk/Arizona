import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';

const base = process.env.FULL_STATE_BASE || 'http://localhost:35373';
const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { fullStateSummary } = load('data/full-state-summary.ts');
const { serverStateQuestions } = load('data/full-state-server.ts');
const codes = process.env.FULL_STATE_VERIFY_CODES?.split(',') || Object.keys(fullStateSummary);
const widths = (process.env.FULL_STATE_WIDTHS || '1440,390').split(',').map(Number);
const kinds = (process.env.FULL_STATE_IDENTITIES || 'guest,free,pro,expired').split(',');
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
const accounts = process.env.STATE17_ACCOUNT_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_ACCOUNT_FILE, 'utf8')) : null;
const stage = process.env.FULL_STATE_STAGE || 'local';
const evidence = `.tools/full-state-${stage}`;
fs.mkdirSync(evidence, { recursive: true });
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
let activePage;

async function finish(page, bank) {
  const ids = [];
  for (let index = 0; index < 40; index++) {
    const text = (await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/, '');
    const question = bank.find(item => item.question_text === text);
    assert.ok(question, 'Current-state question');
    ids.push(question.question_id);
    const right = question[`option_${question.correct_option.toLowerCase()}`];
    const options = await page.locator('.q-option').allTextContents();
    const chosen = options.findIndex(option => {
      const correct = option.trim().replace(/^[A-D][.)]\s*/, '') === right;
      return index < 4 ? !correct : correct;
    });
    assert.ok(chosen >= 0);
    await page.locator('.q-option').nth(chosen).click();
    if (index < 39) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(number => [...document.querySelectorAll('.quiz-stem')].at(-1)?.textContent?.trim().startsWith(number + '.'), index + 2);
    }
  }
  assert.equal(new Set(ids).size, 40);
  await page.getByRole('button', { name: 'Submit exam', exact: true }).click();
  await page.locator('.result-summary').waitFor({ timeout: 90000 });
  assert.match(await page.locator('.result-summary').innerText(), /36 of 40 correct/);
  await page.getByRole('button', { name: 'Show explanation', exact: true }).first().click();
  assert.ok((await page.locator('.answer-result .explain a').first().getAttribute('href')).startsWith('https://'));
  return ids;
}

try {
  for (const width of widths) for (const kind of kinds) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    const page = await context.newPage();
    activePage = page;
    page.on('pageerror', error => errors.push({ width, kind, message: error.message }));
    try {
      if (kind !== 'guest') {
        const account = accounts?.[kind] || { email: `pack-${kind}-${width > 600 ? 'desktop' : 'mobile'}@example.invalid`, password: TEST_PASSWORD };
        const login = await context.request.post(base + '/api/auth/login/', { data: account });
        assert.equal(login.status(), 200, `${kind} login ${await login.text()}`);
      }
      for (const code of codes) {
        const pack = packFor(code), bank = serverStateQuestions(code);
        const accessible = await (await context.request.get(`${base}/api/state/questions/?state=${code}`)).json();
        assert.equal(accessible.questions.length, kind === 'pro' ? 203 : 60);
        for (const href of [pack.paths.home, pack.paths.study, pack.paths.studyCards, pack.paths.pricing, pack.paths.questions, pack.paths.daily, pack.paths.mistakes, pack.paths.resources]) {
          const response = await page.goto(base + href, { waitUntil: 'networkidle' });
          assert.equal(response.status(), 200, `${code} ${href}`);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${code} ${href} overflow`);
        }
        await page.goto(base + pack.paths.study);
        await page.getByRole('button', { name: 'Mark chapter read', exact: true }).first().click();
        await page.reload();
        await page.getByRole('button', { name: 'Marked read', exact: true }).first().waitFor();
        await page.getByRole('button', { name: 'Marked read', exact: true }).first().click();
        await page.goto(`${base}${pack.paths.studyCards}?topic=${pack.topics[0].id}`);
        await page.getByRole('button', { name: 'Show answer', exact: true }).click();
        await page.getByRole('button', { name: 'Show question', exact: true }).waitFor();
        await page.getByRole('link', { name: 'Practice This Topic', exact: true }).click();
        await page.locator('.q-option').first().waitFor({ timeout: 45000 });
        const topicStem = (await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/, '');
        assert.ok(bank.some(question => question.study_topic === pack.topics[0].id && question.question_text === topicStem));
        if (process.env.FULL_STATE_SWITCH === '1') {
          const previous = codes.indexOf(code) === 0 ? '/california/practice/' : packFor(codes[codes.indexOf(code) - 1]).paths.practice;
          await page.goto(base + previous);
          await page.getByRole('button', { name: /Choose state/ }).click();
          await page.getByRole('menuitem', { name: new RegExp(`${pack.name} \\\(${code}\\)`) }).click();
          await page.waitForURL(url => url.pathname === pack.paths.practice);
        } else await page.goto(base + pack.paths.practice);
        const full = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Comprehensive Practice', exact: true }) });
        const start = full.getByRole('button', { name: 'Start', exact: true });
        const account = await (await context.request.get(base + '/api/auth/me/')).json();
        const canStart = kind === 'guest' || kind === 'pro' || !account.user?.packFullExamCount?.[code];
        await start.waitFor();
        await start.click();
        if (canStart) {
          await page.locator('.q-option').first().waitFor({ timeout: 45000 });
          const ids = await finish(page, bank);
          if (kind !== 'pro') assert.ok(ids.every(id => accessible.questions.some(question => question.question_id === id)));
          else assert.ok(ids.some(id => bank.find(question => question.question_id === id)?.is_free === false));
          const attempt = new URL(page.url()).searchParams.get('attempt');
          await page.reload();
          await page.locator('.result-summary').waitFor({ timeout: 45000 });
          assert.match(await page.locator('.result-summary').innerText(), /36 of 40 correct/);
          if (kind !== 'guest') {
            const saved = await (await context.request.get(base + '/api/progress/')).json();
            assert.equal(saved.exams.filter(exam => exam.id === attempt && exam.mode === `${code.toLowerCase()}-full`).length, 1);
            assert.equal(saved.exams.find(exam => exam.id === attempt).correctCount, 36);
          }
        } else {
          await page.getByRole('heading', { name: 'Free Comprehensive Practice already used', exact: true }).waitFor();
          await page.getByRole('link', { name: 'Unlock Pro', exact: true }).waitFor();
        }
        await page.screenshot({ path: `${evidence}/${code}-${kind}-${width}.png` });
        results.push({ code, width, kind, routes: 8, cards: true, bank: accessible.questions.length, full: canStart, score: canStart ? '36/40' : null });
        fs.writeFileSync(`${evidence}/result.json`, JSON.stringify({ base, results, errors }, null, 2));
        console.log(JSON.stringify(results.at(-1)));
      }
    } finally {
      if (kind !== 'guest') await context.request.post(base + '/api/auth/logout/').catch(() => {});
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: `${evidence}/failure.png` }).catch(() => {});
  fs.writeFileSync(`${evidence}/failure.json`, JSON.stringify({ base, results, errors, error: error.message }, null, 2));
  throw error;
} finally {
  await browser.close();
}

