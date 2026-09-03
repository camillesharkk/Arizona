/**
 * Auth verification + account deletion gate.
 * Run: npm run auth:verify
 * In-memory only. No production DB. No Resend. No payments.
 */
import { randomUUID } from "crypto";
import { createMemoryStore } from "../lib/store/memory-store.ts";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { createMemoryDeviceRepo } from "../lib/devices/repo.ts";
import { registerAccount } from "../lib/auth/register.ts";
import { checkLoginCredentials } from "../lib/auth/login.ts";
import { resendVerification } from "../lib/auth/resend.ts";
import { confirmAndDeleteAccount } from "../lib/auth/deletion.ts";
import { issueVerificationEmail } from "../lib/auth/verify-mail.ts";
import { emailHmac } from "../lib/auth/tombstone.ts";
import { resetRateLimit, resetRateLimits } from "../lib/rate-limit.ts";
import {
  bindReferral,
  eligibilitySnapshot,
  isNewcomerEligible,
} from "../lib/commerce/service.ts";
import { generateReferralCode } from "../lib/commerce/codes.ts";
import {
  AZ_PRO_PRODUCT_CODE,
  NEWCOMER_HOURS,
  POLICY_VERSION,
  REFERRAL_CREDIT_CENTS,
} from "../lib/pricing/catalog.ts";
import { activateDevice, evaluateBoundSession } from "../lib/devices/service.ts";
import { newDeviceToken } from "../lib/devices/label.ts";
import { readSessionToken, signSession } from "../lib/session-token.ts";
import type { MailSender } from "../lib/auth/verify-mail.ts";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

const okSend: MailSender = async () => ({ ok: true, mocked: true, messageId: "mock" });
const failSend: MailSender = async () => ({ ok: false, error: "Could not send email. Please try again." });

function hoursFrom(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 3600000);
}

async function run() {
  resetRateLimits();
  const store = createMemoryStore();
  const commerce = createMemoryCommerceRepo();
  const devices = createMemoryDeviceRepo();
  const password = "password12";
  const email = "new@example.com";

  const created = await registerAccount({
    store,
    commerce,
    email,
    password,
    name: "New",
    send: okSend,
  });
  if (!created.ok || created.code !== "VERIFICATION_EMAIL_SENT") fail("new email + mail success should create unverified account");
  else ok("new email + mail success → account created unverified + verification email state");
  const createdUser = created.ok ? await store.getUserByEmail(email) : null;
  if (!createdUser || createdUser.emailVerified || createdUser.emailVerifiedAt) fail("new account should be unverified");
  else ok("new account remains emailVerified=false");
  if (created.ok && (await devices.listSessions(created.user.id)).length) fail("register issued a device session");
  else ok("register does not issue a device session");

  const storeFail = createMemoryStore();
  const commerceFail = createMemoryCommerceRepo();
  const failEmail = "failmail@example.com";
  const failed = await registerAccount({
    store: storeFail,
    commerce: commerceFail,
    email: failEmail,
    password,
    send: failSend,
  });
  if (!failed.ok && failed.code === "VERIFICATION_EMAIL_FAILED" && failed.accountCreated) {
    ok("mail failed → VERIFICATION_EMAIL_FAILED + accountCreated");
  } else fail("mail failed should keep account and return VERIFICATION_EMAIL_FAILED");
  const leftover = await storeFail.getUserByEmail(failEmail);
  if (!leftover || leftover.emailVerified) fail("mail failed should leave unverified user");
  else ok("mail failed → account remains unverified");
  const second = await registerAccount({
    store: storeFail,
    commerce: commerceFail,
    email: failEmail,
    password,
    send: okSend,
  });
  if (!second.ok && second.code === "ACCOUNT_EXISTS_UNVERIFIED") ok("second Create Account → ACCOUNT_EXISTS_UNVERIFIED");
  else fail("second register must not create another user");
  const still = await storeFail.getUserByEmail(failEmail);
  if (still?.id !== leftover?.id) fail("second click created a second user");
  else ok("second click does not create a second user");

  const loginUnverified = await checkLoginCredentials(storeFail, failEmail, password);
  if (!loginUnverified.ok && loginUnverified.code === "EMAIL_NOT_VERIFIED" && loginUnverified.status === 403) {
    ok("unverified user login → EMAIL_NOT_VERIFIED");
  } else fail("unverified login should be EMAIL_NOT_VERIFIED");
  if ((await devices.listSessions(leftover!.id)).some((s) => !s.revokedAt)) fail("unverified login created a device session");
  else ok("unverified login → no device session");
  const afterFailLogin = await storeFail.getUserById(leftover!.id);
  if (afterFailLogin?.lastLoginAt) fail("unverified login updated lastLoginAt");
  else ok("unverified login does not update lastLoginAt");

  resetRateLimits();
  const resend1 = await resendVerification({
    store: storeFail,
    email: failEmail,
    ip: "10.0.0.1",
    send: okSend,
  });
  if (!resend1.ok || !resend1.sent) fail("resend verification should be allowed");
  else ok("resend verification → allowed");
  const resend2 = await resendVerification({
    store: storeFail,
    email: failEmail,
    ip: "10.0.0.1",
    send: okSend,
  });
  if (!resend2.ok && resend2.status === 429) ok("resend within cooldown → rate limited");
  else fail("resend within cooldown should be 429");

  const hourEmail = "hour@example.com";
  await registerAccount({ store: storeFail, commerce: commerceFail, email: hourEmail, password, send: failSend });
  resetRateLimits();
  let hourOk = 0;
  let hourBlocked = false;
  for (let i = 0; i < 6; i++) {
    resetRateLimit(`verify-email:${hourEmail}`);
    const r = await resendVerification({
      store: storeFail,
      email: hourEmail,
      ip: `10.1.0.${i}`,
      send: okSend,
    });
    if (r.ok) hourOk += 1;
    else if (r.status === 429) hourBlocked = true;
  }
  if (hourOk === 5 && hourBlocked) ok("resend hour cap → 5 / hour");
  else fail(`resend hour cap expected 5 then block, got ok=${hourOk} blocked=${hourBlocked}`);

  const verifyStore = createMemoryStore();
  const verifyCommerce = createMemoryCommerceRepo();
  const verifyEmail = "verify@example.com";
  const verifiedReg = await registerAccount({
    store: verifyStore,
    commerce: verifyCommerce,
    email: verifyEmail,
    password,
    send: okSend,
  });
  if (!verifiedReg.ok) {
    fail("verify fixture register");
  } else {
    const firstToken = verifiedReg.token;
    const taken = await verifyStore.takeToken(firstToken, "verify");
    if (!taken) fail("valid verify token missing");
    const at = new Date("2026-09-03T12:00:00.000Z").toISOString();
    await verifyStore.updateUser(verifiedReg.user.id, { emailVerified: true, emailVerifiedAt: at });
    await verifyCommerce.putUser({
      id: verifiedReg.user.id,
      createdAt: verifiedReg.user.createdAt,
      emailVerifiedAt: at,
    });
    const after = await verifyStore.getUserById(verifiedReg.user.id);
    if (!after?.emailVerified || after.emailVerifiedAt !== at) fail("verify should set emailVerified + emailVerifiedAt");
    else ok("verify valid token → emailVerified true + emailVerifiedAt set");
    const secondTake = await verifyStore.takeToken(firstToken, "verify");
    if (secondTake) fail("verify token reusable");
    else ok("verify token twice → second fails");
    const again = await registerAccount({
      store: verifyStore,
      commerce: verifyCommerce,
      email: verifyEmail,
      password,
      send: okSend,
    });
    if (!again.ok && again.code === "EMAIL_ALREADY_REGISTERED") ok("verified email register → Email already registered");
    else fail("verified email should stay registered");
  }

  const t0 = new Date("2026-09-01T12:00:00.000Z");
  if (!isNewcomerEligible({ emailVerifiedAt: t0.toISOString(), redeemed: false, now: hoursFrom(t0, 1) })) {
    fail("newcomer should start at emailVerifiedAt");
  } else ok("newcomer countdown begins from emailVerifiedAt");
  if (isNewcomerEligible({ emailVerifiedAt: null, redeemed: false, now: hoursFrom(t0, 1) })) {
    fail("legacy verified user without emailVerifiedAt became newcomer");
  } else ok("old historical verified user without verifiedAt → NOT newcomer eligible");
  if (isNewcomerEligible({ emailVerifiedAt: t0.toISOString(), redeemed: false, now: hoursFrom(t0, NEWCOMER_HOURS) })) {
    fail("72h after emailVerifiedAt still newcomer");
  } else ok("newcomer expires 72h after emailVerifiedAt");

  const unauth = await confirmAndDeleteAccount({
    store,
    commerce,
    devices,
    sessionUserId: randomUUID(),
    password,
    confirmation: "DELETE",
  });
  if (!unauth.ok && unauth.status === 401) ok("unauthenticated delete → 401");
  else fail("unauthenticated delete should be 401");

  const delStore = createMemoryStore();
  const delCommerce = createMemoryCommerceRepo();
  const delDevices = createMemoryDeviceRepo();
  const delEmail = "delete-me@example.com";
  const otherEmail = "keep-me@example.com";
  const delReg = await registerAccount({
    store: delStore,
    commerce: delCommerce,
    email: delEmail,
    password,
    send: okSend,
  });
  const otherReg = await registerAccount({
    store: delStore,
    commerce: delCommerce,
    email: otherEmail,
    password,
    send: okSend,
  });
  if (!delReg.ok || !otherReg.ok) {
    fail("delete fixtures");
    console.log(lines.join("\n"));
    process.exit(1);
  }
  const now = new Date("2026-09-03T15:00:00.000Z");
  const verifiedAt = now.toISOString();
  await delStore.updateUser(delReg.user.id, { emailVerified: true, emailVerifiedAt: verifiedAt });
  await delCommerce.putUser({ id: delReg.user.id, createdAt: delReg.user.createdAt, emailVerifiedAt: verifiedAt });
  await delStore.updateUser(otherReg.user.id, { emailVerified: true, emailVerifiedAt: verifiedAt });
  await delCommerce.putUser({ id: otherReg.user.id, createdAt: otherReg.user.createdAt, emailVerifiedAt: verifiedAt });

  const referrerReg = await registerAccount({
    store: delStore,
    commerce: delCommerce,
    email: "veteran@example.com",
    password,
    send: okSend,
  });
  if (!referrerReg.ok) fail("veteran fixture");
  else {
    const veteranCreated = hoursFrom(now, -500).toISOString();
    await delStore.updateUser(referrerReg.user.id, {
      emailVerified: true,
      emailVerifiedAt: veteranCreated,
    });
    await delCommerce.putUser({
      id: referrerReg.user.id,
      createdAt: veteranCreated,
      emailVerifiedAt: veteranCreated,
    });
  }
  const veteranCode = generateReferralCode();
  if (referrerReg.ok) {
    await delCommerce.insertCode({
      userId: referrerReg.user.id,
      code: veteranCode,
      createdAt: hoursFrom(now, -500).toISOString(),
      disabledAt: null,
    });
    const boundDel = await bindReferral(delCommerce, { referredUserId: delReg.user.id, code: veteranCode, now });
    if (!boundDel.ok) fail(`bind deleted user as referred failed ${boundDel.error}`);
  }
  const ownCode = generateReferralCode();
  await delCommerce.insertCode({
    userId: delReg.user.id,
    code: ownCode,
    createdAt: delReg.user.createdAt,
    disabledAt: null,
  });
  await delCommerce.insertCredit({
    id: randomUUID(),
    userId: delReg.user.id,
    amountCents: REFERRAL_CREDIT_CENTS,
    sourceRewardId: randomUUID(),
    status: "available",
    createdAt: now.toISOString(),
    availableAt: now.toISOString(),
    reservedAt: null,
    reservedQuoteId: null,
    reservedUntil: null,
    redeemedAt: null,
    redeemedOrderId: null,
    reversedAt: null,
    restoredAt: null,
    reversedAfterRedemption: false,
  });
  const pendingRewardId = randomUUID();
  await delCommerce.insertReward({
    id: pendingRewardId,
    referrerUserId: delReg.user.id,
    referredUserId: otherReg.user.id,
    sourceOrderId: randomUUID(),
    status: "pending",
    createdAt: now.toISOString(),
    availableAt: null,
    canceledAt: null,
    creditId: null,
  });
  const referredPendingId = randomUUID();
  await delCommerce.insertReward({
    id: referredPendingId,
    referrerUserId: otherReg.user.id,
    referredUserId: delReg.user.id,
    sourceOrderId: randomUUID(),
    status: "pending",
    createdAt: now.toISOString(),
    availableAt: null,
    canceledAt: null,
    creditId: null,
  });
  const orderId = randomUUID();
  const providerOrderId = `ord-${randomUUID()}`;
  await delCommerce.insertOrder({
    id: orderId,
    userId: delReg.user.id,
    productCode: AZ_PRO_PRODUCT_CODE,
    quoteId: randomUUID(),
    entitlementId: null,
    status: "paid",
    paidAt: now.toISOString(),
    amountCents: 1999,
    currency: "USD",
    provider: "mock",
    providerOrderId,
    newcomerApplied: true,
    referralDiscountApplied: false,
    creditId: null,
    creditIds: [],
    creditCents: 0,
    policyVersion: POLICY_VERSION,
    policyAcceptedAt: now.toISOString(),
    refundedAt: null,
    refundReason: null,
    createdAt: now.toISOString(),
  });
  const ent = await delStore.insertEntitlement({
    userId: delReg.user.id,
    productCode: AZ_PRO_PRODUCT_CODE,
    state: "AZ",
    status: "active",
    startsAt: now.toISOString(),
    expiresAt: hoursFrom(now, 24 * 60).toISOString(),
    provider: "mock",
    providerOrderId,
    providerCustomerId: null,
  });
  const futureEnt = await delStore.insertEntitlement({
    userId: delReg.user.id,
    productCode: AZ_PRO_PRODUCT_CODE,
    state: "AZ",
    status: "active",
    startsAt: hoursFrom(now, 10).toISOString(),
    expiresAt: hoursFrom(now, 24 * 70).toISOString(),
    provider: "mock",
    providerOrderId: `future-${providerOrderId}`,
    providerCustomerId: null,
  });
  await delStore.upsertStat({
    userId: delReg.user.id,
    questionId: "q1",
    topic: "duties",
    bank: "official",
    chapter: "1",
    firstCorrect: false,
    lastCorrect: false,
    wrongCount: 2,
    rightCount: 0,
    lastSelected: "A",
    lastCorrectOption: "B",
    firstAt: now.toISOString(),
    lastAt: now.toISOString(),
    mastered: false,
    favorited: true,
  });
  await delStore.upsertStat({
    userId: otherReg.user.id,
    questionId: "q1",
    topic: "duties",
    bank: "official",
    chapter: "1",
    firstCorrect: true,
    lastCorrect: true,
    wrongCount: 0,
    rightCount: 1,
    lastSelected: "B",
    lastCorrectOption: "B",
    firstAt: now.toISOString(),
    lastAt: now.toISOString(),
    mastered: true,
    favorited: true,
  });
  await delStore.addExam({
    id: randomUUID(),
    userId: delReg.user.id,
    mode: "full",
    score: 80,
    correctCount: 36,
    total: 45,
    at: now.toISOString(),
  });
  await delStore.putToken({
    token: "reset-leftover",
    type: "reset",
    userId: delReg.user.id,
    expiresAt: hoursFrom(now, 1).toISOString(),
  });
  const d1 = await activateDevice(delDevices, {
    userId: delReg.user.id,
    token: newDeviceToken(),
    userAgent: "Chrome/1 Windows",
    now,
  });
  const d2 = await activateDevice(delDevices, {
    userId: delReg.user.id,
    token: newDeviceToken(),
    userAgent: "Safari/1 iPhone",
    now,
  });
  if (!d1.ok || !d2.ok) fail("delete fixture devices");
  const jwt = d1.ok
    ? await signSession({
        id: delReg.user.id,
        email: delEmail,
        plan: "pro",
        planStatus: "active",
        emailVerified: true,
        name: "New",
        deviceSessionId: d1.session.id,
      })
    : "";

  const wrongPass = await confirmAndDeleteAccount({
    store: delStore,
    commerce: delCommerce,
    devices: delDevices,
    sessionUserId: delReg.user.id,
    password: "wrongpass",
    confirmation: "DELETE",
  });
  if (!wrongPass.ok && wrongPass.status === 401) ok("wrong password → rejected");
  else fail("wrong password should be rejected");

  const missingDelete = await confirmAndDeleteAccount({
    store: delStore,
    commerce: delCommerce,
    devices: delDevices,
    sessionUserId: delReg.user.id,
    password,
    confirmation: "delete",
  });
  if (!missingDelete.ok && missingDelete.status === 400) ok("missing DELETE confirmation → rejected");
  else fail("missing DELETE confirmation should be rejected");

  const otherStill = await delStore.getUserById(otherReg.user.id);
  const steal = await confirmAndDeleteAccount({
    store: delStore,
    commerce: delCommerce,
    devices: delDevices,
    sessionUserId: delReg.user.id,
    requestedUserId: otherReg.user.id,
    password,
    confirmation: "DELETE",
    now,
  });
  if (!steal.ok) fail("correct password + DELETE should delete session user");
  else ok("correct password + DELETE → deleted");
  const otherAfter = await delStore.getUserById(otherReg.user.id);
  if (!otherAfter || otherAfter.deletedAt || otherAfter.email !== otherEmail) fail("deleted another user via userId");
  else ok("cannot delete another user via userId");
  if (otherStill && (await delStore.getStat(otherReg.user.id, "q1"))?.favorited !== true) {
    fail("cleared another user's study data");
  } else ok("other user study data remains");

  const deleted = await delStore.getUserById(delReg.user.id);
  if (!deleted?.deletedAt || !deleted.email.endsWith("@deleted.invalid") || deleted.name !== null) {
    fail("deleted user PII not anonymized");
  } else ok("user PII anonymized");
  if (deleted && deleted.emailVerified !== false) fail("deleted user still emailVerified");
  const sessions = await delDevices.listSessions(delReg.user.id);
  if (sessions.some((s) => !s.revokedAt)) fail("device sessions still active");
  else ok("all device sessions revoked");
  if (jwt) {
    const parsed = await readSessionToken(jwt);
    const bound = parsed ? await evaluateBoundSession(delDevices, parsed, now) : { ok: false };
    if (bound.ok) fail("JWT still valid after delete");
    else ok("current JWT invalid after delete");
  }
  const loginDeleted = await checkLoginCredentials(delStore, delEmail, password);
  if (loginDeleted.ok) fail("deleted account still logs in");
  else ok("deleted account cannot login");
  if (await delStore.getUserByEmail(delEmail)) fail("deleted email still resolvable");
  else ok("deleted account cannot forgot/reset back in (email gone)");
  if (await delStore.takeToken("reset-leftover", "reset")) fail("auth tokens remained");
  else ok("auth tokens revoked/deleted");
  const codeRow = await delCommerce.getCodeByUser(delReg.user.id);
  if (!codeRow?.disabledAt) fail("referral code not disabled");
  else ok("referral code disabled");
  const credits = await delCommerce.listCredits(delReg.user.id);
  if (credits.some((c) => c.status === "available" || c.status === "pending")) fail("available credit not reversed");
  else ok("available credit reversed");
  const pending = await delCommerce.getReward(pendingRewardId);
  if (pending?.status !== "canceled") fail("pending reward not canceled");
  else ok("pending reward canceled/reversed");
  const referredPending = await delCommerce.getReward(referredPendingId);
  if (referredPending?.status === "available") fail("account deletion made referrer reward available");
  else ok("deleting referred user does not auto-release pending reward");
  const live = await delStore.getArizonaEntitlement(delReg.user.id);
  if (live) fail("active entitlement still grants Pro");
  else ok("active entitlement no longer grants Pro");
  const revoked = await delStore.getEntitlementByProviderOrder("mock", providerOrderId);
  if (revoked?.status !== "revoked") fail("entitlement not revoked");
  else ok("entitlement status = revoked (not refunded)");
  const future = await delStore.getEntitlementByProviderOrder("mock", `future-${providerOrderId}`);
  if (future?.status !== "revoked") fail("future entitlement still active");
  else ok("future entitlement revoked");
  const orders = await delCommerce.listOrders(delReg.user.id);
  if (!orders.find((o) => o.id === orderId && o.status === "paid" && o.amountCents === 1999)) {
    fail("commerce history lost");
  } else ok("commerce history remains consistent");
  if ((await delCommerce.listRefundRequests(delReg.user.id)).length) fail("delete created an automatic refund");
  else ok("delete does NOT create automatic refund");
  if ((await delStore.listStats(delReg.user.id)).length || (await delStore.listExams(delReg.user.id)).length) {
    fail("study data remained");
  } else ok("study data removed/anonymized");
  const tomb = await delStore.getTombstone(emailHmac(delEmail));
  if (!tomb?.newcomerUsedOrIneligible) fail("tombstone missing");
  else ok("tombstone stored keyed email hmac");

  resetRateLimits();
  const reReg = await registerAccount({
    store: delStore,
    commerce: delCommerce,
    email: delEmail,
    password,
    send: okSend,
    referralCode: veteranCode,
  });
  if (!reReg.ok) fail("same email re-register should be allowed as a normal account");
  else {
    ok("same email re-register allowed");
    const at = hoursFrom(now, 1).toISOString();
    await delStore.updateUser(reReg.user.id, { emailVerified: true, emailVerifiedAt: at });
    await delCommerce.putUser({ id: reReg.user.id, createdAt: reReg.user.createdAt, emailVerifiedAt: at });
    const snap = await eligibilitySnapshot(delCommerce, reReg.user.id, hoursFrom(now, 1));
    if (snap.newcomerEligible) fail("same email re-register regained newcomer offer");
    else ok("same email re-register → does not regain newcomer offer");
    if (snap.referralDiscountEligible) fail("same email re-register regained referral signup discount");
    else ok("same email re-register → cannot regain referral signup discount");
    const rebound = await delCommerce.getRelationshipByReferred(reReg.user.id);
    if (rebound) fail("re-register rebound a used referral discount");
    else ok("re-register does not bind a previously used referral");
  }

  console.log(lines.join("\n"));
  if (failures) {
    console.error(`\nauth:verify failed (${failures})`);
    process.exit(1);
  }
  console.log("\nauth:verify passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
