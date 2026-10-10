import { chromium } from "file:///C:/Users/20683/AppData/Local/Temp/cursor-sandbox-cache/f100d92d3c061fd8544fdf569fb13bc6/npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";

const base = "http://localhost:3006";
const fail = (msg) => {
  console.error("FAIL", msg);
  process.exitCode = 1;
};
const ok = (msg) => console.log("OK", msg);

async function startQuick(page) {
  await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "load" });
  await page.locator("button.card", { hasText: "Quick 10" }).click();
  await page.waitForSelector(".q-option");
}

async function startFull(page) {
  await page.goto(`${base}/arizona-notary-practice-test/`, { waitUntil: "load" });
  await page.locator("button.card", { hasText: "Full 45" }).click();
  await page.waitForSelector(".q-option");
}

async function qLabel(page) {
  return page.locator(".exam-pad .notice").first().innerText();
}

async function explainStatus(page) {
  const el = page.locator(".explain strong").first();
  if (!(await el.count())) return "";
  return (await el.innerText()).trim();
}

async function clickUntil(page, status) {
  for (let i = 0; i < 4; i++) {
    await startQuick(page);
    await page.locator(".q-option").nth(i).click();
    await page.waitForTimeout(250);
    if ((await explainStatus(page)) === status) return true;
  }
  return false;
}

async function runViewport(size, name) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: size });
  console.log(`\n== ${name} ${size.width}x${size.height} ==`);

  if (!(await clickUntil(page, "Not quite."))) fail(`${name}: could not land a wrong Quick 10 answer`);
  else {
    const before = await qLabel(page);
    await page.waitForTimeout(1200);
    const after = await qLabel(page);
    const explain = await page.locator(".explain").first().innerText();
    if (before !== after) fail(`${name}: wrong answer auto-advanced (${before} -> ${after})`);
    else if (!(await page.locator(".explain").first().innerText()).includes("Not quite") || !(await page.locator(".explain").first().innerText()).toLowerCase().includes("official source")) fail(`${name}: wrong answer missing feedback/source`);
    else ok(`${name}: wrong stays with explanation + official source`);
    await page.getByRole("button", { name: "Next" }).click();
    const next = await qLabel(page);
    if (next === before) fail(`${name}: Next did not move after a wrong answer`);
    else ok(`${name}: Next after wrong works`);
    await page.getByRole("button", { name: "Previous" }).click();
    if ((await qLabel(page)) !== before) fail(`${name}: Previous did not return`);
    else ok(`${name}: Previous works`);
  }

  if (!(await clickUntil(page, "Correct."))) fail(`${name}: could not land a correct Quick 10 answer`);
  else {
    const q1 = await qLabel(page);
    await page.waitForTimeout(400);
    if ((await qLabel(page)) !== q1) fail(`${name}: correct advanced before 400ms`);
    else ok(`${name}: correct still on same question at 400ms`);
    await page.waitForTimeout(800);
    const q2 = await qLabel(page);
    if (q2 === q1) fail(`${name}: correct did not auto-advance by 1200ms`);
    else ok(`${name}: correct auto-advanced (${q1} -> ${q2})`);
  }

  if (!(await clickUntil(page, "Correct."))) fail(`${name}: skip-guard setup failed`);
  else {
    const from = await qLabel(page);
    await page.getByRole("button", { name: "Next" }).click();
    const afterManual = await qLabel(page);
    await page.waitForTimeout(1200);
    const stayed = await qLabel(page);
    if (afterManual === from) fail(`${name}: Next during countdown did not move`);
    else if (stayed !== afterManual) fail(`${name}: cancelled timer still advanced (${afterManual} -> ${stayed})`);
    else ok(`${name}: Next during countdown cancelled auto-advance`);
  }

  await startQuick(page);
  for (let n = 0; n < 9; n++) await page.getByRole("button", { name: "Next" }).click();
  const last = await qLabel(page);
  if (!last.includes("10 of 10")) fail(`${name}: did not reach last question (${last})`);
  const hasView = await page.getByRole("button", { name: "View results" }).count();
  if (!hasView) fail(`${name}: last question missing View results`);
  else ok(`${name}: last question shows View results`);
  if (await clickOptionMatching(page, "Correct.")) {
    await page.waitForTimeout(1400);
    if (await page.getByRole("heading", { name: /PASS|NEEDS REVIEW/ }).count()) fail(`${name}: last correct auto-submitted`);
    else if (!(await page.getByRole("button", { name: "View results" }).count())) fail(`${name}: last correct lost View results`);
    else ok(`${name}: last correct does not auto-submit`);
  } else {
    ok(`${name}: last-question correct click not found this seed (View results already verified)`);
  }

  await startFull(page);
  const fullBefore = await qLabel(page);
  await page.locator(".q-option").nth(0).click();
  await page.waitForTimeout(200);
  const leaked = (await page.locator(".explain").count()) > 0;
  await page.waitForTimeout(1200);
  const fullAfter = await qLabel(page);
  if (leaked) fail(`${name}: Full 45 revealed explanation before submit`);
  else if (fullAfter !== fullBefore) fail(`${name}: Full 45 auto-advanced`);
  else if (!fullBefore.includes("1 of 45")) fail(`${name}: Full 45 not on question 1 (${fullBefore})`);
  else ok(`${name}: Full 45 no reveal and no auto-advance`);

  await startQuick(page);
  if (await clickOptionMatching(page, "Correct.")) {
    await page.getByRole("button", { name: "Change mode" }).click();
    await page.waitForTimeout(1200);
    await page.locator("button.card", { hasText: "Quick 10" }).click();
    await page.waitForSelector(".q-option");
    const again = await qLabel(page);
    if (!again.includes("1 of 10")) fail(`${name}: restart after correct landed on ${again}`);
    else ok(`${name}: Change mode cancelled pending auto-advance`);
  }

  await page.goto(`${base}/arizona/questions/identification/`, { waitUntil: "load" });
  await page.waitForSelector(".q-option");
  const topicBefore = await page.locator("h3").first().innerText();
  await page.locator(".q-option").nth(0).click();
  await page.waitForTimeout(250);
  const topicStatus = await explainStatus(page);
  if (topicStatus === "Not quite.") {
    await page.waitForTimeout(1200);
    if ((await page.locator("h3").first().innerText()) !== topicBefore) fail(`${name}: topic wrong auto-advanced`);
    else ok(`${name}: topic practice wrong stays`);
  } else if (topicStatus === "Correct.") {
    await page.waitForTimeout(1200);
    if ((await page.locator("h3").first().innerText()) === topicBefore) fail(`${name}: topic correct did not auto-advance`);
    else ok(`${name}: topic practice correct auto-advanced`);
  }

  await browser.close();
}

async function clickOptionMatching(page, needle) {
  for (let i = 0; i < 4; i++) {
    const count = await page.locator(".q-option").count();
    if (i >= count) return false;
    const disabled = await page.locator(".q-option").nth(i).isDisabled();
    if (disabled) return (await page.locator(".explain").first().innerText()).includes(needle);
    await page.locator(".q-option").nth(i).click();
    await page.waitForTimeout(200);
    const text = await explainStatus(page);
    if (text === needle) return true;
  }
  return false;
}

await runViewport({ width: 390, height: 844 }, "mobile");
await runViewport({ width: 1440, height: 900 }, "desktop");
if (!process.exitCode) console.log("\nquiz-flow PASS");
