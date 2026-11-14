import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader } from './pack-test-utils.mjs';
import { browserRequest } from './browser-request.mjs';

const base = process.env.STATE17_BASE || 'http://127.0.0.1:3493';
const stage = process.env.STATE17_STAGE || 'ri-tx-local';
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
const account = JSON.parse(fs.readFileSync(process.env.STATE17_ACCOUNT_FILE || '.tools/ri-tx-local-account.json', 'utf8')).free;
const { packFor } = testLoader()('lib/prep-pack.ts');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const rows = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
    const page = await context.newPage();
    await page.goto(base + '/');
    const login = await browserRequest(page, base + '/api/auth/login/', { data: account });
    assert.equal(login.status(), 200);
    const me = (await (await browserRequest(page, base + '/api/auth/me/')).json()).user;
    for (const code of ['RI', 'TX']) {
      const pack = packFor(code);
      const wrongPattern = '**/api/mistakes/**';
      let release;
      const waiting = new Promise(resolve => { release = resolve; });
      await page.route(wrongPattern, async route => {
        await waiting;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ state: code, accountId: me.id, mistakes: [] }) });
      });
      await page.goto(base + pack.paths.mistakes);
      await page.getByText('Loading your questions…', { exact: true }).waitFor();
      assert.equal(await page.getByText('No missed or saved questions on this account yet.', { exact: true }).count(), 0);
      release();
      await page.getByText('No missed or saved questions on this account yet.', { exact: true }).waitFor();
      await page.unroute(wrongPattern);
      await page.route(wrongPattern, route => route.fulfill({ status: 503, body: '{}' }));
      await page.reload();
      await page.getByText('Could not load your questions.', { exact: true }).waitFor();
      await page.unroute(wrongPattern);
      await page.getByRole('button', { name: 'Retry', exact: true }).click();
      await page.getByRole('button', { name: 'Practice wrong answers', exact: true }).waitFor();
      const dailyPattern = '**/api/daily-study/**';
      let releaseDaily;
      const dailyWaiting = new Promise(resolve => { releaseDaily = resolve; });
      await page.route(dailyPattern, async route => { await dailyWaiting; await route.continue(); });
      await page.goto(base + pack.paths.daily);
      await page.getByText('Loading your study plan…', { exact: true }).waitFor();
      releaseDaily();
      await page.getByRole('heading', { name: `${pack.name} Daily Study`, exact: true }).waitFor();
      await page.locator('.daily-practice-quiz').waitFor();
      await page.unroute(dailyPattern);
      await page.route(dailyPattern, route => route.fulfill({ status: 503, body: '{}' }));
      await page.reload();
      await page.getByText('Could not load today’s plan.', { exact: true }).waitFor();
      await page.unroute(dailyPattern);
      await page.getByRole('button', { name: 'Retry', exact: true }).click();
      await page.locator('.daily-practice-quiz').waitFor();
      await page.goto(base + pack.paths.study);
      const mark = page.getByRole('button', { name: 'Mark chapter read', exact: true });
      await mark.first().waitFor();
      for (let index = 0; index < pack.topics.length && await mark.count(); index++) await mark.first().click();
      await page.getByText('All chapters marked. Review with Quick 10 or topic practice.', { exact: true }).waitFor();
      const marked = page.getByRole('button', { name: 'Marked read', exact: true });
      while (await marked.count()) await marked.first().click();
      assert.equal(await page.locator('main a[href*="mode=full"], main a[href*="/pricing/"]').count(), 0);
      const closedPricing = await page.goto(`${base}${pack.paths.home}pricing/`);
      assert.ok([200, 404].includes(closedPricing.status()));
      await page.getByRole('heading', { name: 'Page not found', exact: true }).waitFor();
      assert.ok((await page.locator('meta[name="robots"]').last().getAttribute('content')).includes('noindex'));
      rows.push({ code, width, mistakesLoadingEmptyFailureRetry: true, dailyLoadingFailureRetry: true, completeGuideNext: 'quick-or-topic', pricing: 'unavailable' });
    }
    await browserRequest(page, base + '/api/auth/logout/', { data: {} });
    await context.clearCookies();
    for (const code of ['RI', 'TX']) {
      const pack = packFor(code);
      await page.goto(`${base}${pack.paths.practice}?mode=full`);
      await page.getByRole('button', { name: 'Start Free Quick 10', exact: true }).waitFor();
      assert.equal(await page.evaluate(key => localStorage.getItem(key), pack.anonKey), null);
    }
    await context.close();
  }
  fs.writeFileSync(`.tools/${stage}-surfaces.json`, JSON.stringify({ base, rows }, null, 2));
  console.log(JSON.stringify(rows));
} finally { await browser.close(); }
