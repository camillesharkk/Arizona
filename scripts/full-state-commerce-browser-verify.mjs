import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';
import { browserRequest } from './browser-request.mjs';

const base = process.env.FULL_STATE_BASE || 'http://localhost:35373';
const load = testLoader();
const { fullStateSummary } = load('data/full-state-summary.ts');
const { packFor } = load('lib/prep-pack.ts');
const codes = process.env.FULL_STATE_VERIFY_CODES?.split(',') || Object.keys(fullStateSummary);
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
const accountFile = process.env.STATE17_ACCOUNT_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_ACCOUNT_FILE, 'utf8')) : null;
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const rows = [];
const stage = process.env.FULL_STATE_STAGE || 'local';
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
    const page = await context.newPage();
    page.setDefaultTimeout(45000);
    for (const code of codes) {
      const pack = packFor(code);
      await page.goto(base + pack.paths.pricing);
      const entry = page.getByRole('link', { name: 'Create Free Account to Unlock Offer', exact: true });
      await entry.waitFor();
      assert.equal(new URL(await entry.getAttribute('href'), base).searchParams.get('next'), pack.paths.pricing);
    }
    const first = packFor(codes[0]);
    await page.goto(base + first.paths.pricing);
    await page.getByRole('link', { name: 'Create Free Account to Unlock Offer', exact: true }).click();
    await page.locator('main').getByRole('link', { name: 'Already have an account?', exact: true }).click();
    const account = accountFile?.free || { email: `pack-free-${width > 600 ? 'desktop' : 'mobile'}@example.invalid`, password: TEST_PASSWORD };
    await page.locator('input[type="email"]').fill(account.email);
    await page.locator('input[type="password"]').fill(account.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(url => url.pathname === first.paths.pricing, { timeout: 90000 });
    for (const code of codes) {
      const pack = packFor(code);
      await page.goto(base + pack.paths.pricing);
      await page.locator('.policy-accept input').check();
      const cta = page.getByRole('button', { name: /^Get 60-Day Pro/ });
      await cta.waitFor();
      assert.equal(await cta.isEnabled(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      let checkoutCreated = null;
      if (process.env.CREATE_UNPAID_CHECKOUT === '1' && width === 1440) {
        const [response] = await Promise.all([
          page.waitForResponse(response => new URL(response.url()).pathname === '/api/billing/checkout/' && response.request().method() === 'POST', { timeout: 90000 }),
          cta.click(),
        ]);
        assert.equal(response.status(), 200, `${code} checkout`);
        const request = response.request().postDataJSON();
        const checkout = await response.json();
        assert.equal(request.sourceState, code);
        assert.equal(checkout.provider, 'paddle');
        assert.ok(checkout.transactionId && checkout.finalPriceCents > 0);
        await page.waitForFunction(() => location.hostname.includes('paddle') || [...document.querySelectorAll('iframe')].some(frame => /paddle/i.test(frame.src)), null, { timeout: 20000 });
        const apiPage = await context.newPage();
        await apiPage.goto(base + pack.paths.pricing);
        const retry = await (await browserRequest(apiPage, base + '/api/billing/checkout/', { data: request })).json();
        assert.equal(retry.transactionId, checkout.transactionId, `${code} immutable checkout binding`);
        const me = await (await browserRequest(apiPage, base + '/api/auth/me/')).json();
        assert.equal(me.user.arizonaPro, false, 'Unpaid checkout preserves free access');
        await apiPage.close();
        checkoutCreated = true;
      }
      rows.push({ code, width, guestStateReturn: true, signInStateReturn: true, policyGate: true, checkoutCreated });
      console.log(JSON.stringify(rows.at(-1)));
    }
    await page.goto(base + '/');
    await browserRequest(page, base + '/api/auth/logout/', { data: {} });
    await context.close();
  }
  fs.writeFileSync(`.tools/full-state-${stage}-commerce.json`, JSON.stringify({ base, rows }, null, 2));
} finally {
  await browser.close();
}
