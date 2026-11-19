
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, symlink } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const uriFile = process.env.COMMUNITY_VERIFY_DATABASE_FILE;
assert.ok(uriFile, "Pass the isolated preview URL file as COMMUNITY_VERIFY_DATABASE_FILE.");
const database = new URL((await readFile(uriFile, "utf8")).trim());
assert.equal(database.hostname, "ep-still-voice-a74guk0q.ap-southeast-2.aws.neon.tech", "Use the isolated Neon preview endpoint.");
const schema = "community_browser_" + randomUUID().replaceAll("-", "");
const scopedUrl = new URL(database.href);
scopedUrl.searchParams.set("options", "-c search_path=" + schema);
const operator = postgres(database.href, { max: 1, ssl: "require", onnotice: () => {} });
const fixture = postgres(scopedUrl.href, { max: 1, ssl: "require", onnotice: () => {} });
const root = process.cwd();
const workspace = path.join(root, ".tools", schema);
const { chromium } = await import(pathToFileURL(path.resolve(
  process.env.COMMUNITY_VERIFY_PLAYWRIGHT || ".tools/browser/node_modules/playwright/index.mjs",
)));
const password = randomUUID();
const writer = { id: "writer", email: "writer@example.test", name: "Private Writer Name" };
const reader = { id: "reader", email: "reader@example.test", name: "Private Reader Name" };
const moderator = { id: "moderator", email: "moderator@example.test", name: "Private Moderator Name" };
let server;
let browser;
let schemaCreated = false;

async function availablePort() {
  const socket = createServer();
  await new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", resolve);
  });
  const { port } = socket.address();
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

async function seed() {
  await operator`create schema ${operator(schema)}`;
  schemaCreated = true;
  assert.equal((await fixture`select current_schema() as name`)[0].name, schema);
  await fixture`create table schema_migrations (id text primary key, applied_at timestamptz not null default now())`;
  for (const file of (await readdir("db/migrations")).filter((name) => name.endsWith(".sql")).sort()) {
    const source = await readFile(path.join("db/migrations", file), "utf8");
    await fixture.begin(async (tx) => {
      await tx.unsafe(source);
      await tx`insert into schema_migrations (id) values (${file.slice(0, -4)})`;
    });
  }
  const hash = bcrypt.hashSync(password, 4);
  for (const user of [writer, reader, moderator]) {
    await fixture`insert into users (id, email, password_hash, name, email_verified)
      values (${user.id}, ${user.email}, ${hash}, ${user.name}, true)`;
  }
  await fixture`insert into entitlements (id, user_id, product_code, state, status, starts_at, provider, provider_order_id)
    values ('test-pro', ${writer.id}, 'all_state_pro_lifetime', 'ALL', 'active', now(), 'mock', 'test-pro')`;
}

async function startApp() {
  // Use a disposable project copy so Next.js cannot change checked-out TypeScript configuration.
  await mkdir(workspace, { recursive: true });
  for (const name of ["app", "components", "data", "lib", "public", "package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts", "next.config.ts", "middleware.ts"]) {
    await cp(path.join(root, name), path.join(workspace, name), { recursive: true });
  }
  await symlink(path.join(root, "node_modules"), path.join(workspace, "node_modules"), "junction");
  const port = await availablePort();
  const base = "http://127.0.0.1:" + port;
  server = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: workspace,
    windowsHide: true,
    env: {
      ...process.env,
      DATABASE_URL: scopedUrl.href,
      AUTH_SECRET: randomUUID() + randomUUID(),
      OPERATIONS_ADMIN_EMAILS: moderator.email,
      NEXT_DIST_DIR: ".next",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });
  const ready = await new Promise((resolve) => {
    const timer = setTimeout(resolve, 30_000, false);
    server.stdout.on("data", (chunk) => {
      if (!chunk.toString().includes("Ready")) return;
      clearTimeout(timer);
      resolve(true);
    });
    // Drain child output without logging configuration or account data.
    server.stderr.resume();
    server.once("exit", () => { clearTimeout(timer); resolve(false); });
  });
  assert.ok(ready, "Isolated Next.js server did not start");
  return base;
}

async function signIn(page, user) {
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function setupNickname(page, nickname) {
  await page.locator("#community-nickname").fill(nickname);
  await page.getByRole("button", { name: "Save nickname" }).click();
  await page.getByText("Change nickname (" + nickname + ")", { exact: true }).waitFor();
}

async function usingContext(viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await context.route("https://**/*", (route) => route.abort());
  await context.addInitScript((accounts) => {
    for (const id of accounts) localStorage.setItem("notary-site-update:2026-11-18-announcements-and-exam-review:" + id, "seen");
  }, [writer.id, reader.id, moderator.id]);
  return context;
}

try {
  await seed();
  const base = await startApp();
  const url = base + "/community-insights/";
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const mobile = await usingContext({ width: 390, height: 844 });
  const page = await mobile.newPage();
  const title = "How do you schedule notary practice?";
  const body = "My first study session worked better with short intervals.";
  await page.goto(url);
  await page.getByRole("heading", { name: "Community Insights", exact: true }).waitFor();
  await page.getByRole("link", { name: "Community rules" }).waitFor();
  await page.getByLabel("Title (required)").fill(title);
  await page.getByLabel("Message (required)").fill(body);
  await page.getByRole("link", { name: "Sign in to post" }).click();
  await page.waitForURL("**/login/**");
  await signIn(page, writer);
  await page.waitForURL("**/community-insights/#community-discussions");
  await page.waitForFunction((value) => document.querySelector('textarea[name="body"]')?.value === value, body);
  assert.equal(await page.getByLabel("Title (required)").inputValue(), title);
  assert.equal((await fixture`select count(*)::int as count from community_posts`)[0].count, 0, "Login must not auto-publish.");
  if (process.env.COMMUNITY_VERIFY_NICKNAME_SCREENSHOT) {
    await page.locator(".community-member-panel").scrollIntoViewIfNeeded();
    await page.screenshot({ path: process.env.COMMUNITY_VERIFY_NICKNAME_SCREENSHOT });
  }
  await setupNickname(page, "StudyWriter");
  assert.equal(await page.getByLabel("Message (required)").inputValue(), body);
  await page.getByRole("button", { name: "Post discussion" }).click();
  await page.waitForURL(/\/community-insights\/\?discussion=/);
  await page.getByRole("heading", { name: title }).waitFor();
  const thread = page.url();
  const id = new URL(thread).searchParams.get("discussion");
  const guest = await usingContext({ width: 1440, height: 900 });
  const publicPage = await guest.newPage();
  await publicPage.goto(thread);
  await publicPage.getByText(/StudyWriter ·/).waitFor();
  assert.doesNotMatch(await publicPage.locator("#community-discussions").innerText(), /Private Writer Name|writer@example/);
  const replyBody = "The practice questions helped me see which topics need work.";
  await publicPage.getByLabel("Message (required)").fill(replyBody);
  await publicPage.getByRole("link", { name: "Sign in to post" }).click();
  await publicPage.waitForURL("**/login/**");
  await signIn(publicPage, reader);
  await publicPage.waitForURL(/\/community-insights\/\?discussion=.*#reply-composer/);
  await publicPage.waitForFunction((value) => document.querySelector('textarea[name="body"]')?.value === value, replyBody);
  await setupNickname(publicPage, "FocusedReader");
  await publicPage.getByRole("button", { name: "Post reply", exact: true }).click();
  await publicPage.locator(".community-post .community-message").filter({ hasText: replyBody }).waitFor();
  const [{ id: replyId }] = await fixture`select id::text from community_posts where thread_id = ${id}`;
  console.log("Mobile guest draft, real login return, nickname consent, new-user publishing, and reply draft passed.");

  await page.reload();
  const report = page.locator("#community-message-" + replyId + " details.community-report");
  await report.locator("summary").click();
  await report.getByLabel("Suspicious link or scam").check();
  const reportNote = "Fixture report note.";
  await report.getByLabel("Additional details (optional)").fill(reportNote);
  await report.getByRole("button", { name: "Send report" }).click();
  await report.getByRole("status").filter({ hasText: /report/i }).waitFor();
  await page.reload();
  await report.locator("summary").click();
  await report.getByLabel("Spam", { exact: true }).check();
  await report.getByRole("button", { name: "Send report" }).click();
  await report.getByRole("status").filter({ hasText: /report/i }).waitFor();
  assert.equal((await fixture`select count(*)::int as count from community_reports where post_id = ${replyId}`)[0].count, 1);
  const outsider = await usingContext({ width: 390, height: 844 });
  const reportingPage = await outsider.newPage();
  await reportingPage.goto(thread);
  await reportingPage.locator("#community-message-" + id + " > .row").getByRole("link", { name: "Report" }).click();
  await reportingPage.waitForURL("**/login/**");
  await signIn(reportingPage, reader);
  await reportingPage.waitForURL((value) => value.searchParams.get("report") === id && value.hash === "#community-message-" + id);
  const rootReport = reportingPage.locator("#community-message-" + id + " > .row details.community-report");
  await rootReport.locator("summary").waitFor();
  assert.ok(await rootReport.evaluate((node) => node.open));
  await reportingPage.getByRole("button", { name: /open account menu/i }).waitFor();
  await rootReport.getByLabel("Other").check();
  if (process.env.COMMUNITY_VERIFY_SCREENSHOT) {
    await rootReport.scrollIntoViewIfNeeded();
    await reportingPage.screenshot({ path: process.env.COMMUNITY_VERIFY_SCREENSHOT });
  }
  if (process.env.COMMUNITY_VERIFY_DESKTOP_SCREENSHOT) {
    await publicPage.locator(".community-post").scrollIntoViewIfNeeded();
    await publicPage.screenshot({ path: process.env.COMMUNITY_VERIFY_DESKTOP_SCREENSHOT });
  }
  await rootReport.getByRole("button", { name: "Send report" }).click();
  await rootReport.getByRole("status").filter({ hasText: /report/i }).waitFor();
  assert.equal((await fixture`select count(*)::int as count from community_reports where post_id = ${id}`)[0].count, 1);
  assert.doesNotMatch(await reportingPage.locator("#community-discussions").innerText(), /Fixture report note|writer@example/);
  const denied = await publicPage.goto(base + "/admin/community/");
  assert.equal(denied?.status(), 403, "Server denies the community dashboard to an ordinary account.");
  console.log("Mobile Report, login return target, private report notes, duplicate reports, and non-admin dashboard denial passed.");

  await page.goto(url);
  const suspiciousBody = "My resource for the test is https://bit.ly/test-fixture";
  await page.getByLabel("Title (required)").fill("A resource to check");
  await page.getByLabel("Message (required)").fill(suspiciousBody);
  await page.getByRole("button", { name: "Post discussion" }).click();
  await page.getByRole("button", { name: "Write another message" }).waitFor();
  assert.equal(await page.getByLabel("Message (required)").inputValue(), suspiciousBody);
  await page.locator(".community-member-panel summary").filter({ hasText: /^Awaiting review/ }).waitFor();
  const [{ id: pendingId, moderation_status }] = await fixture`select id::text, moderation_status from community_posts where body = ${suspiciousBody}`;
  assert.equal(moderation_status, "pending");
  const pendingUrl = url + "?discussion=" + pendingId;
  const publicPending = await outsider.request.get(pendingUrl);
  assert.doesNotMatch(await publicPending.text(), /My resource for the test/);
  console.log("Suspicious link pending, author-only preview, retained draft, and hidden direct link passed.");

  const admin = await usingContext({ width: 1400, height: 900 });
  const adminPage = await admin.newPage();
  const adminLogin = await admin.request.post(base + "/api/auth/login/", { data: { email: moderator.email, password } });
  assert.equal(adminLogin.status(), 200);
  async function moderate(postId, action, reason) {
    await adminPage.goto(base + "/admin/community/?post=" + postId);
    await adminPage.locator('select[name="action"]').selectOption(action);
    await adminPage.locator('textarea[name="reason"]').fill(reason);
    if (action === "restore") await adminPage.locator('input[name="confirm"]').check();
    await adminPage.getByRole("button", { name: "保存处理结果" }).click();
    await adminPage.getByText("操作已保存，并写入处理记录。", { exact: true }).waitFor();
    const [{ action: latest }] = await fixture`select action from community_moderation_log order by id desc limit 1`;
    assert.equal(latest, action);
  }
  await moderate(replyId, "hide", "Individually hide reply fixture.");
  await moderate(id, "hide", "Hide root fixture.");
  assert.doesNotMatch(await (await outsider.request.get(thread)).text(), /My first study session|practice questions helped/);
  await moderate(id, "restore", "Restore root fixture after manual review.");
  const publicRestored = await (await outsider.request.get(thread)).text();
  assert.match(publicRestored, /My first study session/);
  assert.doesNotMatch(publicRestored, /practice questions helped/);
  await moderate(pendingId, "approve", "Reviewed the fixture link.");
  assert.match(await (await outsider.request.get(pendingUrl)).text(), /My resource for the test/);
  await moderate(id, "warn", "Fixture moderation warning.");
  await moderate(id, "ban", "Fixture community restriction.");
  await page.goto(thread);
  await page.getByText(/Your community account is restricted/).waitFor();
  await page.getByText(/Moderation notices/).click();
  await page.getByText("Fixture moderation warning.", { exact: true }).waitFor();
  assert.equal(await page.locator("#community-message-" + id + " > .row").getByRole("button", { name: "Report" }).isDisabled(), true);
  assert.equal(await page.getByLabel("Message (required)").count(), 0);
  const profile = await (await mobile.request.get(base + "/api/auth/me/")).json();
  assert.equal(profile.user.lifetimePro, true);
  assert.equal((await mobile.request.get(base + "/api/daily-study/?state=AZ")).status(), 200);
  await moderate(id, "unban", "Fixture community restriction lifted.");
  await page.reload();
  await page.getByRole("button", { name: "Post reply", exact: true }).waitFor();
  console.log("Post and reply visibility, approve, audit, warning, ban/unban, lifetime entitlement and Daily Study passed.");
} finally {
  if (browser) await browser.close();
  if (server?.pid) {
    if (process.platform === "win32") {
      const child = spawn("taskkill.exe", ["/pid", String(server.pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" });
      await new Promise((resolve) => { child.once("exit", resolve); child.once("error", resolve); });
    } else server.kill();
  }
  await fixture.end({ timeout: 3 });
  try {
    if (schemaCreated) await operator`drop schema ${operator(schema)} cascade`;
  } finally {
    await operator.end({ timeout: 3 });
  }
  assert.ok(workspace.startsWith(path.resolve(".tools") + path.sep) && path.basename(workspace) === schema);
  await rm(workspace, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 });
}
