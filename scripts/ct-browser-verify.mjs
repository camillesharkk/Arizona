import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3436';
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):/);
const load = testLoader();
const banks = { CT: load('data/ct-content.ts').publishedCtQuestions(), AZ: load('data/questions.ts').publishedQuestions() };
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
let activePage;
fs.mkdirSync('.tools/ct-browser-evidence', { recursive: true });
async function currentQuestion(page, state = 'CT') {
  const stem = (await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/, '');
  const question = banks[state].find(q => q.question_text === stem);
  assert.ok(question, state + ' unknown stem: ' + stem);
  return question;
}
async function answer(page, correct, state = 'CT') {
  const question = await currentQuestion(page, state);
  const options = await page.locator('.q-option').allTextContents();
  const right = question['option_' + question.correct_option.toLowerCase()];
  const index = options.findIndex(text => correct ? text.trim().slice(3) === right : text.trim().slice(3) !== right);
  assert.ok(index >= 0);
  await page.locator('.q-option').nth(index).click();
  return question;
}
async function complete(page, count, correctCount, state = 'CT', practice = true) {
  for (let index = 0; index < count; index++) {
    await page.locator('.q-option').first().waitFor();
    const question = await answer(page, index >= count - correctCount, state);
    if (index === 0 && state === 'CT') {
      assert.equal(await page.getByRole('link', { name: 'Open Official Handbook', exact: true }).count(), 1);
      if (practice && correctCount < count) {
        await page.getByRole('button', { name: 'Show explanation', exact: true }).click();
        assert.ok((await page.locator('.answer-result > .explain').first().innerText()).includes(question.source_reference));
        assert.equal(await page.locator('.answer-result > .explain').first().getByText(/is wrong\./).count(), 3);
      }
    }
    if (index < count - 1) {
      const previous = await page.locator('.quiz-stem').last().innerText();
      const next = page.getByRole('button', { name: 'Next', exact: true });
      // Quick practice may advance after a correct answer through the existing shared setting.
      if ((await page.locator('.quiz-stem').last().innerText()).trim().startsWith((index + 1) + '.')) await next.click();
      await page.waitForFunction(number => document.querySelector('.quiz-stem')?.textContent?.trim().startsWith(number + '.'), index + 2);
    }
  }
  await page.getByRole('button', { name: practice ? 'See results' : 'Submit exam', exact: true }).click();
  if (state === 'CT') await page.getByRole('heading', { name: `${correctCount} of ${count} correct`, exact: true }).waitFor({ timeout: 60000 });
  else { await page.locator('.result-summary').waitFor({ timeout: 60000 }); assert.ok((await page.locator('.result-summary').innerText()).includes(`${correctCount} of ${count} correct`)); }
}
try {
  if (process.argv.includes('--timer')) {
    const page = await browser.newPage();
    await page.goto(base + '/connecticut/practice/?mode=full');
    await page.locator('.q-option').first().waitFor();
    await answer(page, true);
    await page.waitForTimeout(2500);
    assert.equal(await page.locator('.result-summary').count(), 0, 'Untimed CT comprehensive must remain open after first answer');
    assert.equal(await page.locator('.q-option').count(), 4);
    console.log('CT comprehensive remains untimed and open after the first answer');
  } else for (const surface of (process.env.CT_TEST_SURFACES || 'desktop,mobile').split(',')) {
    for (const kind of (process.env.CT_TEST_KINDS || 'guest,free,pro,expired,all').split(',')) {
      const context = await browser.newContext({ viewport: surface === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: surface === 'mobile', hasTouch: surface === 'mobile' });
      const page = await context.newPage();
      activePage = page;
      page.on('pageerror', error => errors.push({ surface, kind, message: error.message }));
      if (kind !== 'guest') {
        const login = await context.request.post(base + '/api/auth/login/', { data: { email: `ct-${kind}-${surface}${process.env.CT_TEST_ACCOUNT_SUFFIX || ""}@example.invalid`, password: TEST_PASSWORD } });
        assert.equal(login.status(), 200, await login.text());
        const account = await (await context.request.get(base + '/api/auth/me/')).json();
        assert.equal(account.user.connecticutPro, ['pro','all'].includes(kind));
        if (kind === 'pro') assert.equal(account.user.arizonaPro, false);

      }
      await page.goto(base + '/');
      const ctEntry = page.locator('a[href="/connecticut/"]').first();
      if (await ctEntry.count()) await ctEntry.click();
      else { await page.getByRole('button', { name: /Choose state/i }).first().click(); await page.getByRole('menuitem', { name: /Connecticut/ }).click(); }
      await page.getByRole('heading', { name: 'Connecticut Notary Prep', exact: true }).waitFor();
      await page.waitForFunction(() => document.title === 'Connecticut Notary Prep');
      assert.equal(await page.title(), 'Connecticut Notary Prep');
      const canonicals = await page.locator('link[rel="canonical"]').evaluateAll(nodes => nodes.map(node => node.href));
      assert.ok(canonicals.includes('https://arizonanotaryprep.com/connecticut/'));
      const staleNavigationMetadata = canonicals.length > 1;
      assert.ok((await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.map(node => node.content))).some(content => content.includes('noindex')));
      assert.equal(await page.getByRole('link', { name: 'Open Official Application', exact: true }).getAttribute('href'), 'https://www.elicense.ct.gov/');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.screenshot({ path: `.tools/ct-browser-evidence/${surface}-${kind}-home.png` });
      await page.getByRole('link', { name: 'Practice With the Handbook', exact: true }).click();
      await page.locator('.q-option').first().waitFor();
      const before = await currentQuestion(page);
      await page.reload();
      await page.locator('.q-option').first().waitFor();
      assert.equal((await currentQuestion(page)).question_id, before.question_id);
      await complete(page, 10, 7);
      assert.equal(await page.getByRole('link', { name: 'Review Missed Questions', exact: true }).count(), 1);
      assert.ok(await page.locator('.next-step a[href*="area="]').count());
      const resultUrl = page.url();
      const retry = page.locator('.next-step a[href*="area="]').first();
      const retryHref = await retry.getAttribute('href');
      const area = new URL(retryHref, base).searchParams.get('area');
      await retry.click();
      await page.locator('.q-option').first().waitFor();
      const topicQuestion = await currentQuestion(page);
      assert.equal(topicQuestion.study_topic, area);
      if (!['pro','all'].includes(kind)) assert.equal(topicQuestion.is_free, true);
      await page.goto(resultUrl);
      await page.getByRole('heading', {name:'7 of 10 correct',exact:true}).waitFor();

      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.screenshot({ path: `.tools/ct-browser-evidence/${surface}-${kind}-missed.png` });
      const summary = await page.locator('.result-summary').innerText();
      assert.ok(!/PASS|NEEDS REVIEW|official.*correct|Practice target|80%/.test(summary));
      await page.reload();
      await page.getByRole('heading', { name: '7 of 10 correct', exact: true }).waitFor();
      if (kind === 'guest') {
        await page.getByRole('link', { name: 'Review Missed Questions', exact: true }).click();
        await page.getByRole('link', { name: 'Sign in', exact: true }).last().click();
        await page.waitForURL('**/login/**');
        assert.ok(new URL(page.url()).searchParams.get('next').startsWith('/connecticut/wrong-answers/'));
        await page.getByLabel('Email', { exact: true }).fill(`ct-guestclaim-${surface}${process.env.CT_TEST_ACCOUNT_SUFFIX || ""}@example.invalid`);
        await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
        await page.getByRole('button', { name: 'Sign in', exact: true }).click();
        await page.waitForURL('**/connecticut/wrong-answers/**');
      } else await page.getByRole('link', { name: 'Review Missed Questions', exact: true }).click();
      await page.locator('article.card').first().waitFor({ timeout: 60000 });
      assert.equal(await page.locator('article.card').count(), 3);
      await page.reload();
      await page.locator('article.card').first().waitFor();
      assert.equal(await page.locator('article.card').count(), 3);
      await page.getByRole('button', { name: 'Favorite', exact: true }).first().click();
      const favoriteDialog = page.getByRole('dialog');
      if (await favoriteDialog.isVisible()) await favoriteDialog.getByRole('button', { name: 'Add to Favorites', exact: true }).click();
      await page.getByRole('button', { name: 'Favorited', exact: true }).first().waitFor();
      const missedStems = await page.locator('article.card h3').allTextContents();
      await page.getByRole('button', {name:'Practice wrong answers',exact:true}).click();
      await page.locator('.q-option').first().waitFor();
      assert.ok(missedStems.includes((await currentQuestion(page)).question_text));
      await page.getByRole('button', {name:'Back',exact:true}).click();
      await page.locator('article.card').first().waitFor();
      const rule = page.getByRole('link', { name: 'Study This Rule', exact: true }).first();
      const ruleHref = await rule.getAttribute('href');
      const cardId = new URL(ruleHref, base).searchParams.get('card');
      assert.ok(cardId?.startsWith('ct-card-'));
      await rule.click();
      await page.locator('.study-face').first().waitFor();
      const card = load('data/ct-content.ts').ctCards.find(item => item.id === cardId);
      assert.ok((await page.locator('.study-face').first().innerText()).includes(card.front));
      await page.locator('.study-face').first().click();
      assert.equal(await page.locator('.study-face').first().getAttribute('aria-pressed'), 'true');
      await page.goto(base + '/connecticut/become-a-notary/');
      assert.equal(await page.locator('main ol > li').count(), 7);
      assert.ok((await page.locator('main').innerText()).includes('every examination question'));
      await page.goto(base + '/connecticut/practice/');
      await page.getByRole('button', { name: /Choose state/i }).first().click();
      await page.getByRole('menuitem', { name: /Arizona/ }).click();
      await page.waitForURL('**/arizona-notary-practice-test/**');
      await page.getByRole('heading', { name: 'Arizona Notary Exam Practice Test — Free Quick 10 & Full 45', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Start', exact: true }).first().click();
      await page.locator('.q-option').first().waitFor();
      assert.equal((await currentQuestion(page, 'AZ')).state, 'AZ');
      await page.goto(base + '/arizona-notary-practice-test/');
      await page.locator('.card').filter({has: page.getByRole('heading', {name: 'Full 45', exact: true})}).getByRole('button', { name: 'Start', exact: true }).click();
      await page.locator('.q-option').first().waitFor();
      assert.match(await page.locator('main').innerText(), /1\s*\/\s*45|Question 1 of 45/);
      assert.equal((await currentQuestion(page, 'AZ')).state, 'AZ');
      if (kind === 'all') await complete(page, 45, 45, 'AZ', false);
      await page.getByRole('button', { name: /Choose state/i }).first().click();
      await page.getByRole('menuitem', { name: /Connecticut/ }).click();
      await page.waitForURL('**/connecticut/practice/**');
      await page.getByRole('heading', { name: 'Connecticut Handbook Practice', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Start', exact: true }).first().click();
      await page.locator('.q-option').first().waitFor();
      assert.equal((await currentQuestion(page)).state, 'CT');
      // Completed Quick 10 starts a fresh set through the shared Start entry.
      await complete(page, 10, 10);
      assert.equal(await page.locator('.next-step').getByRole('link', { name: 'Open Official Application', exact: true }).count(), 1);
      await page.screenshot({ path: `.tools/ct-browser-evidence/${surface}-${kind}-perfect.png` });
      await page.goto(base + '/connecticut/daily-study/');
      const daily = await (await context.request.get(base + '/api/daily-study/?state=CT')).json();
      if (daily.practiceQuestionIds.length) {
        const dailyQuiz = page.locator('.daily-practice-quiz');
        await dailyQuiz.locator('.q-option').first().waitFor();
        assert.ok(daily.practiceQuestionIds.includes((await currentQuestion(dailyQuiz)).question_id));
        const dailyQuestion = await currentQuestion(dailyQuiz);
        const dailySave = page.waitForResponse(response => response.url().includes('/api/progress/') && response.request().method() === 'POST' && response.request().postDataJSON()?.questionId === dailyQuestion.question_id);
        await answer(dailyQuiz, true);
        assert.equal((await dailySave).status(), 200);
        const updatedDaily = await (await context.request.get(base + '/api/daily-study/?state=CT')).json();
        const pendingIds = updatedDaily.taskStatus.filter(task => task.kind === 'new-question' && task.status === 'pending').map(task => task.key.slice(9));
        const pendingStems = banks.CT.filter(question => pendingIds.includes(question.question_id)).map(question => question.question_text);
        await page.waitForFunction(stems => {
          const stem = document.querySelector('.daily-practice-quiz .quiz-stem')?.textContent?.replace(/^\d+\.\s*/, '').trim();
          return stems.length ? stems.includes(stem) : !stem;
        }, pendingStems);

      }
      await page.goto(base + '/connecticut/practice/?mode=full');
      await page.locator('.q-option').first().waitFor();
      assert.ok((await page.locator('main').innerText()).includes('No time limit'));
      await complete(page, 40, 39, 'CT', false);
      await page.getByRole('link', { name: 'Review Missed Questions', exact: true }).click();
      await page.locator('article.card').first().waitFor();
      assert.equal(await page.locator('article.card').count(), 1);
      results.push({ surface, kind, staleNavigationMetadata, comprehensive: '39/40 untimed, one scoped mistake', dailyPreset: true, quick: '7/10 and 10/10', handbook: true, exactRuleCard: true, loginReturn: true, refreshedMistakes: 3, favorite: true, azQuick: true, azFull45: kind === 'all' ? 'submitted 45/45' : 'started; free submission pending shared fix', stateSwitch: true });
      console.log(`CT browser passed ${surface} ${kind}`);
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
} catch (error) {
  fs.writeFileSync('.tools/ct-browser-partial.json', JSON.stringify({results, errors}, null, 2));
  if (activePage && !activePage.isClosed()) {
    fs.writeFileSync('.tools/ct-browser-failure.txt', await activePage.locator('body').innerText());
    await activePage.screenshot({path: '.tools/ct-browser-evidence/failure.png'});
  }
  throw error;
} finally { await browser.close(); }
fs.writeFileSync('.tools/ct-browser-result.json', JSON.stringify({ checkedAt: new Date().toISOString(), results, errors }, null, 2));
console.log(JSON.stringify(results, null, 2));
