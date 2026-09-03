/**
 * Device session / active-device policy gate.
 * Run: npm run devices:verify
 * In-memory only. No production DB. Does not mark Pro usage.
 */
import { createMemoryDeviceRepo, isDeviceActive } from "../lib/devices/repo.ts";
import {
  activateDevice,
  evaluateBoundSession,
  revokeOwnDevice,
  signOutCurrent,
  signOutOtherDevices,
  revokeOthersKeepCurrent,
  revokeAllDevices,
} from "../lib/devices/service.ts";
import { newDeviceToken } from "../lib/devices/label.ts";
import { DEVICE_INACTIVE_MS, MAX_ACTIVE_DEVICES, MAX_NEW_DEVICE_ACTIVATIONS_PER_WINDOW } from "../lib/devices/policy.ts";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { markProUsed } from "../lib/commerce/service.ts";
import { readSessionToken, signLegacySession, signSession } from "../lib/session-token.ts";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

async function run() {
  const now = new Date("2026-09-03T12:00:00.000Z");
  const repo = createMemoryDeviceRepo();
  const userId = "user-a";
  const other = "user-b";

  const t1 = newDeviceToken();
  const t2 = newDeviceToken();
  const t3 = newDeviceToken();
  const t4 = newDeviceToken();

  const a1 = await activateDevice(repo, { userId, token: t1, userAgent: "Chrome/1 Windows", now });
  if (!a1.ok) fail("first device");
  else ok("first device → success");

  const a2 = await activateDevice(repo, { userId, token: t2, userAgent: "Safari/1 iPhone", now });
  if (!a2.ok) fail("second device");
  else ok("second device → success");

  const a3 = await activateDevice(repo, { userId, token: t3, userAgent: "Chrome/1 Mac", now });
  if (!a3.ok) fail("third device should succeed under MAX 3");
  else ok("third active device → success");

  const a4 = await activateDevice(repo, { userId, token: t4, userAgent: "Firefox/1 Linux", now });
  if (a4.ok || a4.error !== "DEVICE_LIMIT_REACHED") fail("fourth device should hit DEVICE_LIMIT_REACHED");
  else ok("fourth device → DEVICE_LIMIT_REACHED");

  if (!a1.ok || !a3.ok) {
    console.log(lines.join("\n"));
    process.exit(1);
  }

  const rev = await revokeOwnDevice(repo, { userId, deviceId: a1.session.id, now });
  if (!rev) fail("revoke own device");
  else ok("revoked device frees a slot");

  const a4b = await activateDevice(repo, { userId, token: t4, userAgent: "Firefox/1 Linux", now });
  if (!a4b.ok) fail("fourth device after revoke should succeed");
  else ok("revoked device → frees slot");

  const otherRepoUser = await activateDevice(repo, {
    userId: other,
    token: newDeviceToken(),
    userAgent: "Chrome/1 Windows",
    now,
  });
  const stolen = await revokeOwnDevice(repo, {
    userId,
    deviceId: otherRepoUser.ok ? otherRepoUser.session.id : "nope",
    now,
  });
  if (stolen) fail("revoked another user's device");
  else ok("cannot revoke another user's device");

  const current = a4b.ok ? a4b.session.id : "";
  await signOutCurrent(repo, { userId, deviceSessionId: current, now });
  const afterCurrent = (await repo.listSessions(userId)).filter((s) => !s.revokedAt);
  if (afterCurrent.some((s) => s.id === current) || afterCurrent.length !== 2) {
    fail("sign out current should revoke only current");
  } else ok("sign out current device → only current session revoked");

  const relogin = await activateDevice(repo, { userId, token: t4, userAgent: "Firefox/1 Linux", now });
  if (!relogin.ok) fail("relogin current after sign-out");
  const keep = relogin.ok ? relogin.session.id : "";
  await signOutOtherDevices(repo, { userId, keepDeviceId: keep, now });
  const remain = (await repo.listSessions(userId)).filter((s) => !s.revokedAt);
  if (remain.length !== 1 || remain[0].id !== keep) fail("sign out others should keep current");
  else ok("sign out all other devices → current remains, others revoked");

  const passUser = "user-pass";
  const pKeepTok = newDeviceToken();
  const pKeep = await activateDevice(repo, { userId: passUser, token: pKeepTok, userAgent: "Chrome/1 Windows", now });
  const pOther1 = await activateDevice(repo, { userId: passUser, token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  const pOther2 = await activateDevice(repo, { userId: passUser, token: newDeviceToken(), userAgent: "Chrome/1 Mac", now });
  if (!pKeep.ok || !pOther1.ok || !pOther2.ok) fail("password-policy setup devices");
  else {
    await revokeOthersKeepCurrent(repo, { userId: passUser, keepDeviceId: pKeep.session.id, now });
    const afterPass = (await repo.listSessions(passUser)).filter((s) => !s.revokedAt);
    if (afterPass.length !== 1 || afterPass[0].id !== pKeep.session.id) fail("password-change policy should keep current");
    else ok("password change → other sessions revoked, current kept");
  }

  const stale = createMemoryDeviceRepo();
  const oldNow = new Date(now.getTime() - DEVICE_INACTIVE_MS - 1000);
  const staleTok = newDeviceToken();
  const staleAct = await activateDevice(stale, { userId: "stale", token: staleTok, userAgent: "Chrome/1 Windows", now: oldNow });
  const fresh = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  const fresh2 = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Chrome/1 Mac", now });
  const fresh3 = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Edge/1 Windows", now });
  const staleRow = staleAct.ok ? await stale.getSession(staleAct.session.id) : null;
  if (!staleRow || isDeviceActive(staleRow, now)) fail("30-day inactive device still counted as active");
  else ok("30-day inactive device → does not occupy active quota");
  if (!fresh.ok || !fresh2.ok || !fresh3.ok) fail("inactive device should not block three new actives");
  else ok("inactive device does not block 3 new active devices");
  if (staleAct.ok) {
    const staleJwt = await evaluateBoundSession(stale, { id: "stale", deviceSessionId: staleAct.session.id }, now);
    if (staleJwt.ok) fail("inactive device JWT still valid");
    else ok("inactive device JWT rejected until re-activation");
    const staleBack = await activateDevice(stale, { userId: "stale", token: staleTok, userAgent: "Chrome/1 Windows", now });
    if (staleBack.ok || staleBack.error !== "DEVICE_LIMIT_REACHED") fail("inactive device returned past the 3-device limit");
    else ok("inactive device cannot bypass 3-device limit on return");
  }

  const churn = createMemoryDeviceRepo();
  const churnUser = "churn-user";
  for (let i = 0; i < 5; i++) {
    const token = newDeviceToken();
    const r = await activateDevice(churn, { userId: churnUser, token, userAgent: `Chrome/${i} Windows`, now });
    if (!r.ok) fail(`churn activation ${i + 1} failed`);
    if (r.ok && i < 4) await revokeOwnDevice(churn, { userId: churnUser, deviceId: r.session.id, now });
  }
  const sixth = await activateDevice(churn, { userId: churnUser, token: newDeviceToken(), userAgent: "Chrome/9 Windows", now });
  if (sixth.ok || sixth.error !== "TOO_MANY_DEVICE_CHANGES") fail("6th new device in 7 days should be limited");
  else ok("rapid device churn → TOO_MANY_DEVICE_CHANGES");

  const commerce = createMemoryCommerceRepo();
  await commerce.putUser({ id: userId, createdAt: now.toISOString() });
  const usage = await markProUsed(commerce, { userId, featureCode: "pro_question", entitlements: [], now });
  if (usage.recorded) fail("device tests recorded pro usage");
  const listed = await commerce.listUsageForUser(userId);
  if (listed.length) fail("device login wrote pro usage");
  else ok("device login itself → does NOT mark Pro usage");

  await revokeAllDevices(repo, { userId, now });
  if ((await repo.listSessions(userId)).some((s) => !s.revokedAt)) fail("revoke all left an active session");
  else ok("revoke all devices");

  if (MAX_ACTIVE_DEVICES !== 3) fail("MAX_ACTIVE_DEVICES should be 3");
  else ok("MAX_ACTIVE_DEVICES = 3");
  if (MAX_NEW_DEVICE_ACTIVATIONS_PER_WINDOW !== 5) fail("churn cap should be 5");
  else ok("device churn window remains 5 new activations / 7 days");

  const jwtUser = "jwt-user";
  const jwtRepo = createMemoryDeviceRepo();
  const jwtAct = await activateDevice(jwtRepo, { userId: jwtUser, token: newDeviceToken(), userAgent: "Chrome/1 Windows", now });
  if (!jwtAct.ok) fail("jwt fixture device");
  else {
    const bound = {
      id: jwtUser,
      email: "jwt@example.com",
      plan: "free" as const,
      planStatus: "active",
      emailVerified: true,
      name: null,
      deviceSessionId: jwtAct.session.id,
    };
    const token = await signSession(bound);
    if (!(await readSessionToken(token))) fail("current JWT should parse");
    const legacy = await signLegacySession({
      id: jwtUser,
      email: "jwt@example.com",
      plan: "free",
      planStatus: "active",
      emailVerified: true,
      name: null,
    });
    if (await readSessionToken(legacy)) fail("legacy JWT accepted");
    else ok("legacy JWT rejected / reauth required");
    const before = await evaluateBoundSession(jwtRepo, bound, now);
    if (!before.ok) fail("fresh bound JWT should be usable");
    await revokeOwnDevice(jwtRepo, { userId: jwtUser, deviceId: jwtAct.session.id, now });
    const afterRevoke = await evaluateBoundSession(jwtRepo, bound, now);
    if (afterRevoke.ok) fail("revoked device JWT still valid");
    else ok("revoke device → existing JWT rejected");
  }

  const othersRepo = createMemoryDeviceRepo();
  const othersUser = "others-user";
  const keepDev = await activateDevice(othersRepo, { userId: othersUser, token: newDeviceToken(), userAgent: "Chrome/1 Windows", now });
  const otherDev = await activateDevice(othersRepo, { userId: othersUser, token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  if (!keepDev.ok || !otherDev.ok) fail("sign-out-others fixture");
  else {
    await signOutOtherDevices(othersRepo, { userId: othersUser, keepDeviceId: keepDev.session.id, now });
    const keepOk = await evaluateBoundSession(othersRepo, { id: othersUser, deviceSessionId: keepDev.session.id }, now);
    const otherFail = await evaluateBoundSession(othersRepo, { id: othersUser, deviceSessionId: otherDev.session.id }, now);
    if (!keepOk.ok || otherFail.ok) fail("sign out others did not reject the other JWT");
    else ok("sign out other device → other JWT rejected");
  }

  const pwRepo = createMemoryDeviceRepo();
  const pwUser = "pw-jwt";
  const pwKeep = await activateDevice(pwRepo, { userId: pwUser, token: newDeviceToken(), userAgent: "Chrome/1 Windows", now });
  const pwOther = await activateDevice(pwRepo, { userId: pwUser, token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  if (!pwKeep.ok || !pwOther.ok) fail("password-change jwt fixture");
  else {
    await revokeOthersKeepCurrent(pwRepo, { userId: pwUser, keepDeviceId: pwKeep.session.id, now });
    const keepOk = await evaluateBoundSession(pwRepo, { id: pwUser, deviceSessionId: pwKeep.session.id }, now);
    const otherFail = await evaluateBoundSession(pwRepo, { id: pwUser, deviceSessionId: pwOther.session.id }, now);
    if (!keepOk.ok || otherFail.ok) fail("password change left a revoked JWT valid");
    else ok("password change → revoked JWT rejected");
  }

  const resetRepo = createMemoryDeviceRepo();
  const resetUser = "reset-jwt";
  const resetA = await activateDevice(resetRepo, { userId: resetUser, token: newDeviceToken(), userAgent: "Chrome/1 Windows", now });
  const resetB = await activateDevice(resetRepo, { userId: resetUser, token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  if (!resetA.ok || !resetB.ok) fail("password-reset jwt fixture");
  else {
    await revokeAllDevices(resetRepo, { userId: resetUser, now });
    const a = await evaluateBoundSession(resetRepo, { id: resetUser, deviceSessionId: resetA.session.id }, now);
    const b = await evaluateBoundSession(resetRepo, { id: resetUser, deviceSessionId: resetB.session.id }, now);
    if (a.ok || b.ok) fail("password reset left an old JWT valid");
    else ok("password reset → all old JWT rejected");
  }

  const ghost = createMemoryDeviceRepo();
  const ghostUser = "ghost";
  await activateDevice(ghost, { userId: ghostUser, token: newDeviceToken(), userAgent: "Chrome/1 Windows", now });
  await activateDevice(ghost, { userId: ghostUser, token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  await activateDevice(ghost, { userId: ghostUser, token: newDeviceToken(), userAgent: "Chrome/1 Mac", now });
  const fourth = await activateDevice(ghost, { userId: ghostUser, token: newDeviceToken(), userAgent: "Firefox/1 Linux", now });
  const ghostLegacy = await signLegacySession({
    id: ghostUser,
    email: "ghost@example.com",
    plan: "free",
    planStatus: "active",
    emailVerified: true,
    name: null,
  });
  const ghostParsed = await readSessionToken(ghostLegacy);
  const ghostBound = await evaluateBoundSession(ghost, { id: ghostUser, deviceSessionId: ghostParsed?.deviceSessionId || "" }, now);
  if (ghostParsed || ghostBound.ok) fail("legacy JWT authenticated a fourth device");
  else if (fourth.ok) fail("3-device limit failed while testing legacy JWT");
  else ok("old JWT cannot create invisible fourth device");

  console.log(lines.join("\n"));
  console.log(failures === 0 ? "devices:verify OK" : `devices:verify FAIL failures=${failures}`);
  if (failures) process.exit(1);
}

await run();
