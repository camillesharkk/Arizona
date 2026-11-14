import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';
import { browserRequest } from './browser-request.mjs';

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


async function finish(page, bank, { count = 40, wrongCount = 4, full = true } = {}) {
  const ids = [];
  for (let index = 0; index < count; index++) {
    const text = (await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/, '');
    const question = bank.find(item => item.question_text === text);
    assert.ok(question, 'Current-state question');
    ids.push(question.question_id);
    const right = question[`option_${question.correct_option.toLowerCase()}`];
    const options = await page.locator('.q-option').allTextContents();
    const chosen = options.findIndex(option => {
      const correct = option.trim().replace(/^[A-D][.)]\s*/, '') === right;
      return index < wrongCount ? !correct : correct;
    });
    assert.ok(chosen >= 0);
    await page.locator('.q-option').nth(chosen).click();
    if (index < count - 1) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(number => [...document.querySelectorAll('.quiz-stem')].at(-1)?.textContent?.trim().startsWith(number + '.'), index + 2);
    }
  }
  assert.equal(new Set(ids).size, count);
  await page.getByRole('button', { name: full ? 'Submit exam' : 'See results', exact: true }).click();
  await page.locator('.result-summary').waitFor({ timeout: 90000 });
  assert.ok((await page.locator('.result-summary').innerText()).includes(`${count - wrongCount} of ${count} correct`));
  await page.getByRole('button', { name: 'Show explanation', exact: true }).first().click();
  assert.ok((await page.locator('.answer-result .explain a').first().getAttribute('href')).startsWith('https://'));
  return ids;
}

try {
  for (const width of widths) for (const kind of kinds) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
const page = await context.newPage();
    activePage = page;
    await page.goto(base + "/");
    page.on('pageerror', error => errors.push({ width, kind, message: error.message }));
    try {
      if (kind !== 'guest') {
        const account = accounts?.[kind] || { email: `pack-${kind}-${width > 600 ? 'desktop' : 'mobile'}@example.invalid`, password: TEST_PASSWORD };
        const login = await browserRequest(page, base + '/api/auth/login/', { data: account });
        assert.equal(login.status(), 200, `${kind} login ${await login.text()}`);
      }
      for (const code of codes) {
        const pack = packFor(code), bank = serverStateQuestions(code);
        let tutorProvider = null;
        const accessible = await (await browserRequest(page, `${base}/api/state/questions/?state=${code}`)).json();
        assert.equal(accessible.questions.length, kind === 'pro' ? 203 : 60);
        for (const href of [...new Set([pack.paths.home, pack.paths.study, pack.paths.studyCards, ...(pack.purchaseEnabled === false ? [] : [pack.paths.pricing]), pack.paths.questions, pack.paths.daily, pack.paths.mistakes, pack.paths.resources])]) {
          const response = await page.goto(base + href, { waitUntil: 'domcontentloaded' });
          assert.equal(response.status(), 200, `${code} ${href}`);
          if (kind === 'guest' && href === pack.paths.daily) await page.waitForURL(url => url.pathname === '/login/');
          if (href === pack.paths.questions) await page.getByText(new RegExp(`Question \\d+ of ${accessible.questions.length}`)).first().waitFor();
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
        if (!pack.fullReady) {
          assert.equal(await page.getByRole('heading', { name: 'Comprehensive Practice', exact: true }).count(), 0);
          assert.equal(await page.locator('main a[href*="/pricing/"]').count(), 0);
          const quick = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Quick 10', exact: true }) });
          await quick.getByRole('button', { name: 'Start', exact: true }).click();
          await page.locator('.q-option').first().waitFor();
          const ids = await finish(page, bank, { count: 10, wrongCount: 4, full: false });
          const attempt = new URL(page.url()).searchParams.get('attempt');
          await page.reload();
          await page.locator('.result-summary').waitFor();
          assert.match(await page.locator('.result-summary').innerText(), /6 of 10 correct/);
          if (kind !== 'guest') {
            const saved = await (await browserRequest(page, base + '/api/progress/')).json();
            assert.equal(saved.exams.filter(exam => exam.id === attempt && exam.mode === `${code.toLowerCase()}-quick`).length, 1);
            assert.equal(saved.exams.find(exam => exam.id === attempt).correctCount, 6);
            assert.ok(ids.every(id => saved.stats.some(stat => stat.questionId === id && stat.state === code)));
          }
          await page.screenshot({ path: `${evidence}/${code}-${kind}-${width}.png` });
          results.push({ code, width, kind, routes: 7, cards: true, bank: accessible.questions.length, quick: 10, score: '6/10', refresh: true, full: false, purchase: false });
          fs.writeFileSync(`${evidence}/result.json`, JSON.stringify({ base, results, errors }, null, 2));
          console.log(JSON.stringify(results.at(-1)));
          continue;
        }
        const full = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Comprehensive Practice', exact: true }) });
        const start = full.getByRole('button', { name: 'Start', exact: true });
        const account = await (await browserRequest(page, base + '/api/auth/me/')).json();
        const canStart = kind === 'guest' || kind === 'pro' || !account.user?.packFullExamCount?.[code];
        await start.waitFor();
        await start.click();
        if (canStart) {
          await page.locator('.q-option').first().waitFor({ timeout: 45000 });
          const ids = await finish(page, bank);
          if (kind === 'pro' && process.env.FULL_STATE_TUTOR === '1' && width === widths[0]) {
            const paidIndex = ids.findIndex(id => !bank.find(question => question.question_id === id).is_free);
            const question = page.locator('.card:has(> .quiz-stem)').nth(paidIndex);
            const explanation = question.getByRole('button', { name: 'Show explanation', exact: true });
            if (await explanation.count()) await explanation.click();
            const [response] = await Promise.all([
              page.waitForResponse(response => new URL(response.url()).pathname === '/api/ai/tutor/' && response.request().method() === 'POST', { timeout: 45000 }),
              question.getByRole('button', { name: 'Explain this question', exact: true }).click(),
            ]);
            assert.equal(response.status(), 200, `${code} paid Tutor`);
            assert.equal(response.request().postDataJSON().questionId, ids[paidIndex]);
            const answer = await response.json();
            assert.ok(answer.text?.length > 20);
            assert.equal(answer.plan, 'pro');
            assert.equal(answer.limit, 300);
            tutorProvider = answer.provider;
          }
          if (kind !== 'pro') assert.ok(ids.every(id => accessible.questions.some(question => question.question_id === id)));
          else assert.ok(ids.some(id => bank.find(question => question.question_id === id)?.is_free === false));
          const attempt = new URL(page.url()).searchParams.get('attempt');
          await page.reload();
          await page.locator('.result-summary').waitFor({ timeout: 45000 });
          assert.match(await page.locator('.result-summary').innerText(), /36 of 40 correct/);
          if (kind === 'pro' && process.env.FULL_STATE_REVIEW === '1' && width === widths[0]) {
            const resultUrl = page.url();
            await page.goto(`${base}${pack.paths.mistakes}?attempt=${attempt}`);
            await page.locator('.notice').filter({ hasText: /This practice ·/ }).waitFor();
            await page.getByRole('button', { name: 'Practice wrong answers', exact: true }).click();
            await page.locator('.q-option').first().waitFor({ timeout: 45000 });
            const reviewed = await finish(page, bank, { count: 4, wrongCount: 0, full: false });
            assert.ok(reviewed.every(id => ids.slice(0, 4).includes(id)), `${code} current-sitting review queue`);
            await page.goto(resultUrl);
            await page.locator('.result-summary').waitFor({ timeout: 45000 });
            assert.match(await page.locator('.result-summary').innerText(), /36 of 40 correct/);
          }
          if (kind === 'pro' && process.env.FULL_STATE_TEST_EXPIRE === '1') {
            assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):/);
            const data = path.resolve(process.env.NOTARY_DATA_DIR || '');
            assert.ok(data.startsWith(path.resolve('.tools') + path.sep), 'Expiry mutation stays in isolated local data');
            const fileStore = load('lib/store/file-store.ts').fileStore;
            const rows = (await fileStore.listEntitlements(account.user.id)).filter(row => row.status === 'active');
            const paid = bank.find(question => ids.includes(question.question_id) && !question.is_free);
            await browserRequest(page, base + '/api/mistakes/', { data: { questionId: paid.question_id, saveForReview: true } });
            const resultUrl = page.url();
            await page.waitForLoadState('networkidle');
            try {
              for (const row of rows) await fileStore.setEntitlementStatus(account.user.id, row.provider, row.providerOrderId, 'expired');
              await page.reload();
              await page.locator('.result-summary').waitFor({ timeout: 45000 });
              assert.match(await page.locator('.result-summary').innerText(), /36 of 40 correct/);
              assert.match(await page.locator('.result-summary').innerText(), /Saved result/i);
              assert.equal((await (await browserRequest(page, `${base}/api/state/questions/?state=${code}`)).json()).questions.length, 60);
              await page.goto(base + pack.paths.mistakes);
              await page.getByRole('heading', { name: `Pro question · ${paid.question_id}`, exact: true }).waitFor();
              await page.goto(`${base}${pack.paths.mistakes}?topic=${paid.study_topic}`);
              await page.getByRole('heading', { name: `Pro question · ${paid.question_id}`, exact: true }).waitFor();
              await page.screenshot({ path: `${evidence}/${code}-expired-preserved-${width}.png` });
              const key = load('lib/sitting.ts').sittingKey(account.user.id, 'questions:all:all', code);
              await page.evaluate(key => sessionStorage.removeItem(key), key);
              await page.goto(base + pack.paths.questions);
              await page.getByText(/Question \d+ of 60/).first().waitFor();
            } finally {
              await page.waitForLoadState('networkidle');
              for (const row of rows) await fileStore.setEntitlementStatus(account.user.id, row.provider, row.providerOrderId, row.status);
              await page.goto(base + pack.paths.questions);
              await page.getByText(/Question \d+ of 203/).first().waitFor();
              await page.goto(resultUrl);
              await page.locator('.result-summary').waitFor({ timeout: 45000 });
            }
          }
          if (kind !== 'guest') {
            const saved = await (await browserRequest(page, base + '/api/progress/')).json();
            assert.equal(saved.exams.filter(exam => exam.id === attempt && exam.mode === `${code.toLowerCase()}-full`).length, 1);
            assert.equal(saved.exams.find(exam => exam.id === attempt).correctCount, 36);
          }
        } else {
          await page.getByRole('heading', { name: 'Free Comprehensive Practice already used', exact: true }).waitFor();
          await page.getByRole('link', { name: 'Unlock Pro', exact: true }).waitFor();
        }
        if (kind === 'pro') {
          await page.goto(base + '/dashboard/');
          await page.getByRole('heading', { name: /^Practice readiness \d+%$/ }).waitFor();
          await page.getByRole('heading', { name: 'Personalized study plan', exact: true }).waitFor();
          const training = await page.getByRole('link', { name: 'Train weak areas', exact: true }).getAttribute('href');
          assert.equal(training, `${pack.paths.practice}?mode=weak`);
        }
        await page.screenshot({ path: `${evidence}/${code}-${kind}-${width}.png` });
        results.push({ code, width, kind, routes: 8, cards: true, bank: accessible.questions.length, full: canStart, score: canStart ? '36/40' : null, tutorProvider });
        fs.writeFileSync(`${evidence}/result.json`, JSON.stringify({ base, results, errors }, null, 2));
        console.log(JSON.stringify(results.at(-1)));
      }
    } catch (error) {
      if (!page.isClosed()) {
        await page.screenshot({ path: `${evidence}/failure.png` }).catch(() => {});
        const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'Page unavailable');
        fs.writeFileSync(`${evidence}/failure-page.json`, JSON.stringify({ url: page.url(), body }, null, 2));
      }
      throw error;
    } finally {
      if (kind !== 'guest') await browserRequest(page, base + '/api/auth/logout/', { data: {} }).catch(() => {});
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
} catch (error) {
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: `${evidence}/failure.png` }).catch(() => {});
  fs.writeFileSync(`${evidence}/failure.json`, JSON.stringify({ base, results, errors, error: error.message }, null, 2));
  const message = error.message.replace(/x-vercel-protection-bypass:[^\n]*/gi, 'x-vercel-protection-bypass: [redacted]');
  throw new Error(message);
} finally {
  await browser.close();
}
