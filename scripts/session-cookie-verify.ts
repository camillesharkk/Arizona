/**
 * Session cookie mutation gate.
 * Page render must not 500 when an invalid session cannot clear its cookie.
 * Route handlers must still clear that cookie. No production DB.
 */
import { operationsAccess } from "../lib/operations/report-view.ts";
import { getSession, SESSION_COOKIE, signSession } from "../lib/session.ts";

type Mode = "ok" | "readonly" | "other";

type TestState = {
  token?: string;
  deletes: string[];
  mode: Mode;
  device: {
    id: string;
    userId: string;
    deviceTokenHash: string;
    deviceLabel: string;
    userAgentSummary: string | null;
    createdAt: string;
    lastSeenAt: string;
    revokedAt: string | null;
  } | null;
  user: { id: string; emailVerified: boolean; deletedAt: string | null } | null;
  repoError: Error | null;
  touched: string | null;
};

let failures = 0;
const lines: string[] = [];

function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}

function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

function slot(): { __azSessionCookieTest: TestState } {
  return globalThis as unknown as { __azSessionCookieTest: TestState };
}

function testState(): TestState {
  return slot().__azSessionCookieTest;
}

function reset(mode: Mode) {
  const now = new Date().toISOString();
  slot().__azSessionCookieTest = {
    token: undefined,
    deletes: [],
    mode,
    device: {
      id: "device-1",
      userId: "user-1",
      deviceTokenHash: "hash",
      deviceLabel: "Verify",
      userAgentSummary: null,
      createdAt: now,
      lastSeenAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      revokedAt: null,
    },
    user: { id: "user-1", emailVerified: true, deletedAt: null },
    repoError: null,
    touched: null,
  } satisfies TestState;
}

async function validToken() {
  return signSession({
    id: "user-1",
    email: "member@example.com",
    plan: "free",
    planStatus: "active",
    emailVerified: true,
    name: null,
    deviceSessionId: "device-1",
  });
}

async function run() {
  process.env.AUTH_SECRET = "session-cookie-verify-only";

  reset("readonly");
  testState().token = "not-a-session";
  const rendered = await getSession();
  if (rendered !== null) fail("readonly render returned a session");
  else if (testState().deletes.length !== 1 || testState().deletes[0] !== SESSION_COOKIE) fail("readonly render did not attempt one cookie clear");
  else ok("page render returns null when the invalid cookie cannot be cleared");

  reset("ok");
  testState().token = "not-a-session";
  const cleared = await getSession();
  if (cleared !== null) fail("route handler kept an invalid session");
  else if (testState().deletes.length !== 1 || testState().deletes[0] !== SESSION_COOKIE) fail("route handler did not clear the invalid cookie");
  else ok("route handler clears one invalid session cookie");

  reset("other");
  testState().token = "not-a-session";
  let otherMessage = "";
  try {
    await getSession();
  } catch (error) {
    otherMessage = error instanceof Error ? error.message : "";
  }
  if (otherMessage !== "cookie-backend-failed") fail("unrelated cookie delete error was swallowed");
  else ok("unrelated cookie delete errors still propagate");

  reset("readonly");
  testState().token = await validToken();
  testState().repoError = new Error("store-down");
  const hidden = await getSession();
  if (hidden !== null) fail("store failure during readonly render returned a session");
  else if (testState().deletes.length !== 1) fail("store failure cleared the cookie more than once");
  else ok("store failure during page render returns null without a second delete");

  reset("other");
  testState().token = await validToken();
  testState().repoError = new Error("store-down");
  let masked = "";
  try {
    await getSession();
  } catch (error) {
    masked = error instanceof Error ? error.message : "";
  }
  if (masked !== "store-down") fail("cookie delete replaced the original session error");
  else ok("a failed cookie clear does not replace the original error");

  reset("ok");
  testState().token = await validToken();
  const session = await getSession();
  if (!session || session.id !== "user-1" || session.deviceSessionId !== "device-1") fail("valid session was dropped");
  else if (testState().deletes.length !== 0) fail("valid session cleared its cookie");
  else if (!testState().touched) fail("valid session skipped lastSeenAt");
  else ok("valid session stays bound and updates lastSeenAt");

  reset("ok");
  testState().token = await validToken();
  const device = testState().device;
  if (!device) fail("device fixture missing");
  else {
    device.revokedAt = new Date().toISOString();
    const revoked = await getSession();
    if (revoked !== null || testState().deletes.length !== 1) fail("revoked device session was kept");
    else ok("revoked device session still returns null and clears the cookie");
  }

  reset("readonly");
  testState().token = await validToken();
  testState().user = { id: "user-1", emailVerified: false, deletedAt: null };
  const unverified = await getSession();
  if (unverified !== null) fail("unverified user stayed signed in during readonly render");
  else ok("unverified user still returns null during page render");

  const allow = "ops@example.com";
  if (operationsAccess(null, allow) !== "anonymous") fail("anonymous admin access changed");
  else if (operationsAccess("member@example.com", allow) !== "forbidden") fail("non-admin access changed");
  else if (operationsAccess(allow, allow) !== "ok") fail("allowlisted admin access changed");
  else ok("anonymous, non-admin, and allowlisted admin access stay unchanged");

  console.log(lines.join("\n"));
  if (failures) {
    console.error(`\nsession:verify failed (${failures})`);
    process.exit(1);
  }
  console.log("\nsession:verify passed");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.name : "session:verify error");
  process.exit(1);
});
