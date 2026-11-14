import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const base = process.env.STATE17_BASE || 'http://127.0.0.1:3482';
if (!base.startsWith('http://127.0.0.1:')) throw new Error('Fault injection uses isolated localhost only');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const quick = page => page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Quick 10', exact: true }) });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.route('**/api/auth/me/**', route => route.abort());
    await page.goto(base + '/arkansas/practice/');
    await page.getByRole('alert').filter({ hasText: 'Could not check exam access' }).waitFor();
    await page.unroute('**/api/auth/me/**');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await quick(page).getByRole('button', { name: 'Start', exact: true }).click();
    await page.locator('.q-option').first().waitFor();

    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/api/auth/me/**', async route => { await gate; await route.continue(); });
    await page.goto(base + '/colorado/practice/');
    await quick(page).getByRole('button', { name: 'Start', exact: true }).click();
    await quick(page).getByRole('button', { name: 'Loading…', exact: true }).waitFor();
    release();
    await page.locator('.q-option').first().waitFor();
    await page.unroute('**/api/auth/me/**');
    await page.route('**/api/state/questions/**', route => route.abort());
    await page.goto(base + '/arkansas/practice/?mode=quick&start=1');
    await page.getByRole('alert').filter({ hasText: 'Could not load this practice set.' }).waitFor();
    await page.unroute('**/api/state/questions/**');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.locator('.q-option').first().waitFor();
    const login = await context.request.post(base + '/api/auth/login/', { data: { email: 'pack-pro-http@example.invalid', password: 'Pack-local-test-2026!' } });
    assert.equal(login.status(), 200);
    await page.goto(base + '/colorado/wrong-answers/');
    await page.getByText('No missed or saved questions on this account yet.', { exact: true }).waitFor();
    await page.route('**/api/mistakes/**', route => route.abort());
    await page.reload();
    await page.getByRole('alert').filter({ hasText: 'Could not load your questions.' }).waitFor();
    await page.unroute('**/api/mistakes/**');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.getByText('No missed or saved questions on this account yet.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    results.push({ width, practiceLoadingQueuedStart: true, practiceFailureRetry: true, bankFailureRetry: true, wrongAnswerEmpty: true, wrongAnswerFailureRetry: true });
    await context.close();
  }
  fs.writeFileSync('.tools/state17-ui-states.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
