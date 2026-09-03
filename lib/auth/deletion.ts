import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { Store } from "../store/types.ts";
import type { CommerceRepo } from "../commerce/repo.ts";
import type { DeviceRepo } from "../devices/repo.ts";
import { forfeitReferralOnAccountDeletion } from "../commerce/service.ts";
import { revokeAllDevices } from "../devices/service.ts";
import { emailTombstoneHash, TombstoneSecretError } from "./tombstone.ts";

export async function deleteUserAccount(opts: {
  store: Store;
  commerce: CommerceRepo;
  devices: DeviceRepo;
  userId: string;
  now?: Date;
}) {
  const now = opts.now ?? new Date();
  const at = now.toISOString();
  const user = await opts.store.getUserById(opts.userId);
  if (!user || user.deletedAt) return { ok: false as const, error: "not_found" };

  const originalEmail = user.email;
  let hmac: string;
  try {
    hmac = emailTombstoneHash(originalEmail);
  } catch (err) {
    if (err instanceof TombstoneSecretError) return { ok: false as const, error: "unavailable" };
    throw err;
  }
  const rel = await opts.commerce.getRelationshipByReferred(user.id);
  const hadPaid = await opts.commerce.hasQualifyingPaidOrder(user.id);

  await forfeitReferralOnAccountDeletion(opts.commerce, { userId: user.id, now });
  await opts.store.revokeActiveArizonaEntitlements(user.id);
  await opts.store.clearLearningData(user.id);
  await opts.store.deleteTokensForUser(user.id);
  await revokeAllDevices(opts.devices, { userId: user.id, now });

  const placeholder = `deleted-${randomUUID()}@deleted.invalid`;
  const passwordHash = await bcrypt.hash(randomUUID() + randomUUID(), 10);
  await opts.store.updateUser(user.id, {
    email: placeholder,
    name: null,
    passwordHash,
    emailVerified: false,
    emailVerifiedAt: user.emailVerifiedAt,
    deletedAt: at,
    emailDaily: false,
    emailWeekly: false,
    emailExam: false,
    plan: "free",
    planStatus: "deleted",
    billingCustomerId: user.billingCustomerId,
    billingSubscriptionId: null,
  });

  await opts.store.upsertTombstone({
    emailHmac: hmac,
    deletedAt: at,
    newcomerUsedOrIneligible: true,
    referralDiscountUsedOrIneligible: Boolean(rel),
    hadPaidOrder: hadPaid,
  });

  return { ok: true as const };
}

export async function confirmAndDeleteAccount(opts: {
  store: Store;
  commerce: CommerceRepo;
  devices: DeviceRepo;
  sessionUserId: string;
  password: string;
  confirmation: string;
  requestedUserId?: string;
  now?: Date;
}) {
  void opts.requestedUserId;
  if (opts.confirmation !== "DELETE") {
    return {
      ok: false as const,
      status: 400,
      error: "Password and DELETE confirmation are required.",
    };
  }
  const user = await opts.store.getUserById(opts.sessionUserId);
  if (!user || user.deletedAt) {
    return { ok: false as const, status: 401, error: "Sign in required" };
  }
  if (!(await bcrypt.compare(opts.password, user.passwordHash))) {
    return { ok: false as const, status: 401, error: "Current password is wrong" };
  }
  const result = await deleteUserAccount({
    store: opts.store,
    commerce: opts.commerce,
    devices: opts.devices,
    userId: opts.sessionUserId,
    now: opts.now,
  });
  if (!result.ok) {
    return {
      ok: false as const,
      status: result.error === "unavailable" ? 503 : 400,
      error: "Could not delete account",
    };
  }
  return { ok: true as const };
}
