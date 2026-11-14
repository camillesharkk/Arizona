import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { testLoader } from './pack-test-utils.mjs';

const base = process.env.REGISTER_TEST_BASE || 'http://localhost:3483';
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('Mock-email registration uses isolated localhost only');
const load = testLoader();
const { freeStateCatalog, isFreeState } = load('lib/free-state-catalog.ts');
const { packFor } = load('lib/prep-pack.ts');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
let activePage;
try {
  for (const width of (process.env.REGISTER_WIDTHS || '1440,390').split(',').map(Number)) for (const code of (process.env.REGISTER_STATES || 'AR,CA').split(',')) {
    const slug = isFreeState(code) ? freeStateCatalog.find(([state]) => state === code)[2] : 'california';
    const bank = isFreeState(code) ? packFor(code).questions() : load('data/ca-questions.ts').publishedCaQuestions();
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    activePage = page;
    await page.goto(base + '/register/?next=' + encodeURIComponent('/arkansas/wrong-answers/?attempt=abandoned'));
    await page.getByRole('button', { name: 'Create Free Account', exact: true }).waitFor();
    assert.ok((await context.cookies()).some(cookie => cookie.name === 'np_auth_return'));
    await page.goto(base + '/register/');
    await page.getByRole('button', { name: 'Create Free Account', exact: true }).waitFor();
    assert.equal((await context.cookies()).some(cookie => cookie.name === 'np_auth_return'), false);
    await page.goto(`${base}/${slug}/practice/?mode=quick&start=1`);
    for (let index = 0; index < 10; index++) {
      await page.locator('.quiz-stem').last().waitFor();
      const stem = (await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/, '');
      const question = bank.find(question => question.question_text === stem);
      assert.ok(question);
      const right = question[`option_${question.correct_option.toLowerCase()}`];
      const options = await page.locator('.q-option').allTextContents();
      const wrong = options.findIndex(text => text.trim().replace(/^[A-D][.)]\s*/, '') !== right);
      await page.locator('.q-option').nth(wrong).click();
      if (index < 9) {
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.waitForFunction(number => [...document.querySelectorAll('.quiz-stem')].at(-1)?.textContent?.trim().startsWith(number + '.'), index + 2);
      }
    }
    await page.getByRole('button', { name: 'See results', exact: true }).click();
    await page.locator('.result-summary').waitFor();
    const sittingId = new URL(page.url()).searchParams.get('attempt');
    assert.ok(sittingId);
    await page.locator('.result-summary').getByRole('link', { name: /Review wrong answers|Review My Mistakes/ }).first().click();
    if (new URL(page.url()).pathname !== '/login/') await page.locator('main').getByRole('link', { name: 'Sign in', exact: true }).click();
    await page.getByRole('link', { name: 'Create account', exact: true }).click();
    assert.ok(new URL(page.url()).searchParams.get('next')?.includes(slug));
    const email = `register-${randomUUID()}@example.invalid`;
    await page.getByLabel('Name (optional)', { exact: true }).fill('Registration test');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').first().fill('Register-local-2026!');
    await page.locator('input[type="password"]').last().fill('Register-local-2026!');
    assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), true);
    assert.equal(await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input[type="password"]')];
      return inputs.length === 2 && inputs[0].value === inputs[1].value;
    }), true);
    let result;
    await page.route('**/api/auth/register/', async route => {
      const response = await route.fetch();
      result = await response.json();
      await route.fulfill({ response });
    });
    await page.getByRole('button', { name: 'Create Free Account', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/verify-email/');
    assert.equal(result.ok, true);
    let verifyToken = result.verifyToken;
    if (!verifyToken && process.env.REGISTER_DATA_DIR) {
      const dataDirectory = path.resolve(process.env.REGISTER_DATA_DIR);
      assert.ok(dataDirectory.startsWith(path.resolve('.tools') + path.sep), 'Verification tokens stay in isolated test data');
      const data = JSON.parse(fs.readFileSync(path.join(dataDirectory, 'store.json'), 'utf8'));
      const user = data.users.find(user => user.email === email);
      verifyToken = data.tokens.find(token => token.userId === user.id && token.type === 'verify')?.token;
    }
    assert.ok(verifyToken);
    assert.ok((await page.getByRole('link', { name: 'Back to registration', exact: true }).getAttribute('href')).includes('next='));
    // Email links normally open another tab in the same browser.
    const verified = await context.newPage();
    activePage = verified;
    await verified.goto(`${base}/verify-email/?token=${encodeURIComponent(verifyToken)}`);
    await verified.waitForURL(url => url.pathname === `/${slug}/wrong-answers/`);
    const verifiedAccount = await (await context.request.get(base + '/api/auth/me/')).json();
    assert.ok(verifiedAccount.user, `Verification session missing ${JSON.stringify((await context.cookies()).map(cookie => cookie.name))}`);
    await verified.locator('.notice').filter({ hasText: /This practice ·/ }).waitFor();
    assert.match(await verified.locator('.notice').filter({ hasText: /This practice ·/ }).innerText(), /0\/10/);
    const progress = await (await context.request.get(base + '/api/progress/')).json();
    assert.equal(progress.exams.filter(exam => exam.id === sittingId).length, 1);
    assert.equal(progress.exams.find(exam => exam.id === sittingId).correctCount, 0);
    await verified.reload();
    await verified.locator('.notice').filter({ hasText: /This practice ·/ }).waitFor();
    const repeat = await (await context.request.get(base + '/api/progress/')).json();
    assert.equal(repeat.exams.filter(exam => exam.id === sittingId).length, 1);
    assert.equal(repeat.stats.filter(stat => stat.state === code).reduce((sum, stat) => sum + stat.rightCount + stat.wrongCount, 0), 10);
    results.push({ code, width, guestQuick: 10, registered: true, isolatedEmailVerifiedInNewTab: true, sameSitting: true, score: 0, duplicateExams: 0 });
    console.log(JSON.stringify(results.at(-1)));
    await context.close();
  }
  fs.writeFileSync('.tools/state17-register-browser.json', JSON.stringify(results, null, 2));
} catch (error) {
  if (activePage) {
    await activePage.screenshot({ path: '.tools/state17-register-failure.png' }).catch(() => {});
    const diagnostic = await activePage.evaluate(async () => ({
      path: location.pathname,
      signedIn: Boolean((await (await fetch('/api/auth/me/', { cache: 'no-store' })).json()).user),
      attemptKeys: Object.keys(localStorage).filter(key => key.endsWith('-notary-attempts')),
      body: document.querySelector('main')?.innerText,
    })).catch(() => ({}));
    fs.writeFileSync('.tools/state17-register-failure.json', JSON.stringify(diagnostic, null, 2));
  }
  throw error;
} finally { await browser.close(); }
