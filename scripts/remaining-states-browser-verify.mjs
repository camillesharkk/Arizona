import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader } from './pack-test-utils.mjs';

const base = process.env.STATE17_BASE || 'http://127.0.0.1:3481';
const states = (process.env.VERIFY_STATES || 'AR,CO,IL,ME,MD,MO,MT,NE,NV,NJ,NM,OH,OR,UT,VT,WI,WY').split(',');
const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { freeStateContent } = load('data/free-state-content.ts');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
const stage = process.env.STATE17_STAGE || 'local';
const evidence = `.tools/state17-${stage}`;
fs.mkdirSync(evidence, { recursive: true });
const widths = (process.env.STATE17_WIDTHS || '1440,390').split(',').map(Number);
const account = process.env.STATE17_ACCOUNT_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_ACCOUNT_FILE, 'utf8')).free : null;
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
let activePage;

async function finishQuick(page, pack) {
  const ids = [];
  for (let index = 0; index < 10; index++) {
    const stem = page.locator('.quiz-stem').last();
    await stem.waitFor();
    const text = (await stem.innerText()).replace(/^\d+\.\s*/, '');
    const question = pack.questions().find(item => item.question_text === text);
    assert.ok(question, `${pack.code} correct question bank`);
    ids.push(question.question_id);
    const right = question[`option_${question.correct_option.toLowerCase()}`];
    const options = await page.locator('.q-option').allTextContents();
    const selected = options.findIndex(option => {
      const correct = option.trim().replace(/^[A-D][.)]\s*/, '') === right;
      return index < 3 ? !correct : correct;
    });
    assert.ok(selected >= 0);
    await page.locator('.q-option').nth(selected).click();
    if (index < 9) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(number => [...document.querySelectorAll('.quiz-stem')].at(-1)?.textContent?.trim().startsWith(number + '.'), index + 2);
    }
  }
  assert.equal(new Set(ids).size, 10);
  await page.getByRole('button', { name: 'See results', exact: true }).click();
  await page.locator('.result-summary').waitFor({ timeout: 90000 });
  assert.match(await page.locator('.result-summary').innerText(), /7 of 10 correct/);
  if (pack.freeLaunch) assert.equal(await page.locator('.result-summary a').filter({ hasText: /View Pro|Full Practice/ }).count(), 0);
  else assert.equal(await page.locator('.result-summary a').filter({ hasText: '60-Day Pro' }).count(), 1);
  assert.equal(await page.locator('.result-summary a').filter({ hasText: freeStateContent[pack.code].officialNext.label }).count(), 1);
  await page.getByRole('button', { name: 'Show explanation', exact: true }).first().click();
  const source = page.locator('.answer-result .explain a').first();
  assert.ok((await source.getAttribute('href')).startsWith('https://'));
  return ids;
}

try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    const page = await context.newPage();
    activePage = page;
    page.on('pageerror', error => errors.push({ width, message: error.message }));
    for (const code of states) {
      const pack = packFor(code);
      const home = await page.goto(base + pack.paths.home);
      assert.equal(home.status(), 200, `${code} home`);
      assert.equal(await page.locator(`a[href="${freeStateContent[code].officialNext.url}"]`).count() > 0, true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${code} home overflow`);
      await page.goto(base + pack.paths.study);
      await page.getByRole('heading', { name: pack.freeLaunch ? 'Application order' : 'Chapters', exact: true }).waitFor();
      assert.ok(await page.locator(pack.freeLaunch ? 'section.guide-chapter' : 'article.card').count() >= 3);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${code} guide overflow`);
      // Use a real client navigation through the existing state menu between successive states.
      if (process.env.STATE17_SWITCH === '1') {
        const previous = states.indexOf(code) === 0 ? '/california/practice/' : packFor(states[states.indexOf(code) - 1]).paths.practice;
        await page.goto(base + previous);
        await page.getByRole('button', { name: /Choose state/ }).click();
        await page.getByRole('menuitem', { name: new RegExp(`${pack.name} \\(${code}\\)`) }).click();
        await page.waitForURL(url => url.pathname === pack.paths.practice);
      } else await page.goto(base + pack.paths.practice);
      await page.getByRole('heading', { name: 'Quick 10', exact: true }).waitFor();
      const quickCard = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Quick 10', exact: true }) });
      await quickCard.getByRole('button', { name: 'Start', exact: true }).waitFor();
      assert.equal(await quickCard.getByRole('button', { name: 'Start', exact: true }).count(), 1);
      await quickCard.getByRole('button', { name: 'Start', exact: true }).click();
      await page.locator('.q-option').first().waitFor({ timeout: 45000 });
      const ids = await finishQuick(page, pack);
      await page.reload();
      await page.locator('.result-summary').waitFor({ timeout: 45000 });
      assert.match(await page.locator('.result-summary').innerText(), /7 of 10 correct/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${code} result overflow`);
      let guestImport = false;
      if (account) {
        const sittingId = new URL(page.url()).searchParams.get('attempt');
        assert.ok(sittingId);
        await page.getByRole('link', { name: 'Review wrong answers', exact: true }).first().click();
        await page.locator('main').getByRole('link', { name: 'Sign in', exact: true }).click();
        await page.locator('input[type="email"]').fill(account.email);
        await page.locator('input[type="password"]').fill(account.password);
        await page.getByRole('button', { name: 'Sign in', exact: true }).click();
        await page.waitForURL(url => url.pathname === pack.paths.mistakes, { timeout: 90000 });
        await page.getByRole('heading', { name: /Wrong.answer notebook/i }).waitFor();
        await page.locator('.notice').filter({ hasText: /This practice ·/ }).waitFor({ timeout: 90000 });
        assert.match(await page.locator('.notice').filter({ hasText: /This practice ·/ }).innerText(), /7\/10/);
        const progress = await (await context.request.get(base + '/api/progress/')).json();
        const exam = progress.exams.find(exam => exam.id === sittingId && exam.mode === code.toLowerCase() + '-quick' && exam.total === 10 && exam.correctCount === 7);
        assert.ok(exam, `${code} guest sitting imported ${JSON.stringify({ sittingId, saved: progress.exams.find(exam => exam.id === sittingId) })}`);
        const before = progress.stats.filter(stat => ids.includes(stat.questionId)).reduce((sum, stat) => sum + stat.rightCount + stat.wrongCount, 0);
        await page.reload();
        await page.getByRole('heading', { name: /Wrong.answer notebook/i }).waitFor();
        const after = await (await context.request.get(base + '/api/progress/')).json();
        assert.equal(after.exams.filter(item => item.id === exam.id).length, 1);
        assert.equal(after.stats.filter(stat => ids.includes(stat.questionId)).reduce((sum, stat) => sum + stat.rightCount + stat.wrongCount, 0), before);
        const wrong = await (await context.request.get(base + '/api/mistakes/?state=' + code)).json();
        assert.equal(wrong.state, code);
        assert.equal(wrong.mistakes.every(stat => stat.state === code), true);
        assert.ok(wrong.mistakes.length >= 3);
        guestImport = true;
        await context.request.post(base + '/api/auth/logout/');
        await context.clearCookies();
      }
      await page.screenshot({ path: `${evidence}/${code}-${width}.png` });
      results.push({ code, width, home: 200, guide: true, quick: 10, score: 7, resultRefresh: true, officialLink: true, singleStart: true, guestImport, overflow: false });
      fs.writeFileSync(`${evidence}/result.json`, JSON.stringify({ base, results, errors }, null, 2));
      console.log(JSON.stringify(results.at(-1)));
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
} catch (error) {
  if (activePage) await activePage.screenshot({ path: `${evidence}/failure.png` }).catch(() => {});
  fs.writeFileSync(`${evidence}/failure.json`, JSON.stringify({ base, results, errors, error: error.message }, null, 2));
  throw error;
} finally {
  await browser.close();
}
