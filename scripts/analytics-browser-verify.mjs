/** Real Chrome + actual analytics modules, isolated local fixture, no GA/Paddle requests. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const allowed = new Set(["/lib/analytics.ts", "/lib/paths.ts", "/lib/analytics-upgrades.ts", "/lib/analytics-recovery.ts"]);
let confirmedOrders = [];
let accessRequests = 0;
const server = createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/api/billing/access/") {
    accessRequests++;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ orders: confirmedOrders }));
    return;
  }
  if (allowed.has(path)) {
    res.setHeader("Content-Type", "text/javascript");
    res.end(ts.transpileModule(readFileSync(join(root, path), "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText);
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.end(`<!doctype html><body>
    <a href="/pricing/" data-upgrade-source="header">Pro</a>
    <a href="/pricing/" data-upgrade-source="hidden" style="display:none">Hidden</a>
    <div style="height:2000px"></div><div id="result"></div>
    <script>window.process={env:{NODE_ENV:'production',NEXT_PUBLIC_ANALYTICS_DEBUG:'1',NEXT_PUBLIC_GA_MEASUREMENT_ID:'G-TEST123'}};</script>
    <script type="module">
      import * as analytics from '/lib/analytics.ts';
      import {observeUpgradeLinks} from '/lib/analytics-upgrades.ts';
      import {observePendingPurchases} from '/lib/analytics-recovery.ts';
      analytics.trackPageView('/arizona-notary-practice-test/');
      window.stopTracking = observeUpgradeLinks();
      window.stopRecovery = observePendingPurchases();
      document.addEventListener('click', e => e.preventDefault());
      window.analytics = analytics;
    </script></body>`);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const profile = mkdtempSync(join(tmpdir(), "az-analytics-test-"));
const chrome = spawn(process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "about:blank",
], { stdio: "ignore", windowsHide: true });
let startupError;
chrome.on("error", (error) => { startupError = error; });
let socket;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let port;
  for (let i = 0; i < 60; i++) {
    if (startupError) throw startupError;
    try { port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]); } catch {}
    if (port) break;
    await wait(100);
  }
  if (!port) throw new Error("Chrome did not start");
  const tabs = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
  socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => socket.addEventListener("open", r, { once: true }));
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!pending.has(message.id)) return;
    const { resolve, reject, timer } = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(timer);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const until = async (expression) => {
    for (let i = 0; i < 60; i++) { if (await evaluate(expression)) return; await wait(100); }
    throw new Error(`Timed out: ${expression}`);
  };
  await send("Page.navigate", { url: `http://127.0.0.1:${server.address().port}/` });
  await until("!!window.analytics");
  const events = () => evaluate("window.dataLayer.filter(x=>x[0]==='event').map(x=>({name:x[1],params:x[2]}))");
  await until("window.dataLayer.some(x=>x[1]==='upgrade_view')");
  let rows = await events();
  assert.equal(rows.filter((r) => r.name === "page_view").length, 1);
  assert.equal(rows.some((r) => r.params.entry_point === "hidden"), false);
  assert.equal(rows.find((r) => r.name === "upgrade_view").params.entry_point, "header");
  await evaluate(`document.querySelector('#result').innerHTML='<a href="/pricing/" data-upgrade-source="exam_results">Result upgrade</a>';`);
  await wait(200);
  rows = await events();
  assert.equal(rows.some((r) => r.params.entry_point === "exam_results"), false, "offscreen link counted as seen");
  await evaluate("document.querySelector('#result').scrollIntoView()");
  await until("window.dataLayer.some(x=>x[1]==='upgrade_view'&&x[2].entry_point==='exam_results')");
  await evaluate(`document.querySelector('#result a').click();analytics.trackAnalyticsEvent('pricing_view');analytics.trackBeginCheckout({finalPriceCents:1999},'txn_browser');`);
  rows = await events();
  assert.equal(rows.filter((r) => r.name === "upgrade_click").length, 1);
  assert.equal(rows.find((r) => r.name === "pricing_view").params.upgrade_source, "exam_results");
  assert.equal(rows.find((r) => r.name === "begin_checkout").params.items[0].price, 19.99);
  await evaluate(`analytics.recoverPendingPurchase([{providerOrderId:'txn_other',status:'paid',amountCents:1999,entitlementId:'ent_other'}]);`);
  assert.equal((await events()).filter((r) => r.name === "purchase").length, 0);
  await evaluate(`analytics.recoverPendingPurchase([{providerOrderId:'txn_browser',status:'paid',amountCents:1999,entitlementId:'ent_browser'}]);`);
  rows = await events();
  assert.equal(rows.filter((r) => r.name === "purchase").length, 1);
  assert.equal(rows.filter((r) => r.name === "entitlement_granted").length, 1);
  assert.equal(rows.every((r) => r.params.traffic_type === "internal"), true);
  // A mounted observer with no pending transaction must wake up on a later checkout.
  confirmedOrders = [{providerOrderId:'txn_samepage',status:'paid',amountCents:2221,entitlementId:'ent_samepage'}];
  await evaluate("analytics.trackBeginCheckout({finalPriceCents:2221},'txn_samepage')");
  await until("window.dataLayer.some(x=>x[1]==='purchase'&&x[2].transaction_id==='txn_samepage')");
  assert.ok(accessRequests > 0, "mounted recovery never fetched the newly started checkout");
  await evaluate("stopRecovery()");
  await evaluate("stopTracking();document.querySelector('#result a').click()");
  assert.equal((await events()).filter((r) => r.name === "upgrade_click").length, 1);
  console.log("PASS: Chrome queued first events, visibility/mutation/click attribution, ecommerce items, confirmed-order recovery, debug labels and listener cleanup. No external analytics sent.");
} finally {
  socket?.close();
  chrome.kill();
  server.close();
}
