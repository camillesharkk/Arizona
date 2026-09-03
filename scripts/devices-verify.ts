/**
 * Device session / active-device policy gate.
 * Run: npm run devices:verify
 * In-memory only. No production DB. Does not mark Pro usage.
 */
import { createMemoryDeviceRepo, isDeviceActive } from "../lib/devices/repo.ts";
import {
  activateDevice,
  revokeOwnDevice,
  signOutCurrent,
  signOutOtherDevices,
  revokeOthersKeepCurrent,
  revokeAllDevices,
} from "../lib/devices/service.ts";
import { newDeviceToken } from "../lib/devices/label.ts";
import { DEVICE_INACTIVE_MS, MAX_ACTIVE_DEVICES } from "../lib/devices/policy.ts";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { markProUsed } from "../lib/commerce/service.ts";

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
  const staleAct = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Chrome/1 Windows", now: oldNow });
  const fresh = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Safari/1 iPhone", now });
  const fresh2 = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Chrome/1 Mac", now });
  const fresh3 = await activateDevice(stale, { userId: "stale", token: newDeviceToken(), userAgent: "Edge/1 Windows", now });
  const staleRow = staleAct.ok ? await stale.getSession(staleAct.session.id) : null;
  if (!staleRow || isDeviceActive(staleRow, now)) fail("30-day inactive device still counted as active");
  else ok("30-day inactive device → does not occupy active quota");
  if (!fresh.ok || !fresh2.ok || !fresh3.ok) fail("inactive device should not block three new actives");
  else ok("inactive device does not block 3 new active devices");

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

  console.log(lines.join("\n"));
  console.log(failures === 0 ? "devices:verify OK" : `devices:verify FAIL failures=${failures}`);
  if (failures) process.exit(1);
}

await run();
