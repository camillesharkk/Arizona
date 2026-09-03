import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileStore } from "../store/file-store";
import { createMemoryCommerceRepo, type CommerceRepo } from "./repo.ts";
import type { ClockUser } from "./types.ts";

const filePath = () => path.join(process.cwd(), ".data", "commerce.json");
let queue: Promise<void> = Promise.resolve();

async function loadRaw(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await readFile(filePath(), "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function saveRaw(data: unknown) {
  await mkdir(path.dirname(filePath()), { recursive: true });
  await writeFile(filePath(), JSON.stringify(data, null, 2));
}

function persistWrap(inner: CommerceRepo & { snapshot: () => unknown }): CommerceRepo {
  const wrap = <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
    async (...args: A) => {
      const run = queue.then(async () => {
        const result = await fn(...args);
        await saveRaw(inner.snapshot());
        return result;
      });
      queue = run.then(() => undefined).catch(() => undefined);
      return run;
    };

  return {
    getUser: inner.getUser,
    putUser: wrap(inner.putUser.bind(inner)),
    getCodeByUser: inner.getCodeByUser.bind(inner),
    getCode: inner.getCode.bind(inner),
    insertCode: wrap(inner.insertCode.bind(inner)),
    disableReferralCode: wrap(inner.disableReferralCode.bind(inner)),
    getRelationshipByReferred: inner.getRelationshipByReferred.bind(inner),
    insertRelationship: wrap(inner.insertRelationship.bind(inner)),
    markReferralDiscountRedeemed: wrap(inner.markReferralDiscountRedeemed.bind(inner)),
    hasPromotionRedemption: inner.hasPromotionRedemption.bind(inner),
    insertPromotionRedemption: wrap(inner.insertPromotionRedemption.bind(inner)),
    listCredits: inner.listCredits.bind(inner),
    getCredit: inner.getCredit.bind(inner),
    insertCredit: wrap(inner.insertCredit.bind(inner)),
    setCreditAvailable: wrap(inner.setCreditAvailable.bind(inner)),
    reversePendingCredit: wrap(inner.reversePendingCredit.bind(inner)),
    reserveCredits: wrap(inner.reserveCredits.bind(inner)),
    reserveCredit: wrap(inner.reserveCredit.bind(inner)),
    releaseCreditsForQuote: wrap(inner.releaseCreditsForQuote.bind(inner)),
    releaseCreditReservation: wrap(inner.releaseCreditReservation.bind(inner)),
    listCreditsForQuote: inner.listCreditsForQuote.bind(inner),
    expireReservations: wrap(inner.expireReservations.bind(inner)),
    redeemReservedCredits: wrap(inner.redeemReservedCredits.bind(inner)),
    redeemReservedCredit: wrap(inner.redeemReservedCredit.bind(inner)),
    restoreRedeemedCreditsForOrder: wrap(inner.restoreRedeemedCreditsForOrder.bind(inner)),
    restoreRedeemedCredit: wrap(inner.restoreRedeemedCredit.bind(inner)),
    markCreditReversedAfterRedemption: wrap(inner.markCreditReversedAfterRedemption.bind(inner)),
    insertReward: wrap(inner.insertReward.bind(inner)),
    getRewardByReferred: inner.getRewardByReferred.bind(inner),
    getReward: inner.getReward.bind(inner),
    getRewardByOrder: inner.getRewardByOrder.bind(inner),
    listRewardsForReferrer: inner.listRewardsForReferrer.bind(inner),
    listPendingRewards: inner.listPendingRewards.bind(inner),
    setRewardAvailable: wrap(inner.setRewardAvailable.bind(inner)),
    setRewardCanceled: wrap(inner.setRewardCanceled.bind(inner)),
    setRewardReversed: wrap(inner.setRewardReversed.bind(inner)),
    attachRewardCredit: wrap(inner.attachRewardCredit.bind(inner)),
    insertQuote: wrap(inner.insertQuote.bind(inner)),
    getQuote: inner.getQuote.bind(inner),
    consumeQuote: wrap(inner.consumeQuote.bind(inner)),
    expireQuote: wrap(inner.expireQuote.bind(inner)),
    insertOrder: wrap(inner.insertOrder.bind(inner)),
    getOrder: inner.getOrder.bind(inner),
    getOrderByProvider: inner.getOrderByProvider.bind(inner),
    listOrders: inner.listOrders.bind(inner),
    markOrderRefunded: wrap(inner.markOrderRefunded.bind(inner)),
    hasQualifyingPaidOrder: inner.hasQualifyingPaidOrder.bind(inner),
    insertCreditDebt: wrap(inner.insertCreditDebt.bind(inner)),
    getDebtBySourceCredit: inner.getDebtBySourceCredit.bind(inner),
    listOpenDebts: inner.listOpenDebts.bind(inner),
    applyDebtOffset: wrap(inner.applyDebtOffset.bind(inner)),
    insertUsage: wrap(inner.insertUsage.bind(inner)),
    listUsageForEntitlement: inner.listUsageForEntitlement.bind(inner),
    listUsageForUser: inner.listUsageForUser.bind(inner),
    insertRefundRequest: wrap(inner.insertRefundRequest.bind(inner)),
    listRefundRequests: inner.listRefundRequests.bind(inner),
    completeRefundRequest: wrap(inner.completeRefundRequest.bind(inner)),
  };
}

export async function createFileCommerceRepo(): Promise<CommerceRepo> {
  const raw = await loadRaw();
  const inner = createMemoryCommerceRepo(raw);
  const repo = persistWrap(inner);
  return {
    ...repo,
    async getUser(id): Promise<ClockUser | null> {
      const user = await fileStore.getUserById(id);
      return user
        ? { id: user.id, createdAt: user.createdAt, emailVerifiedAt: user.emailVerifiedAt ?? null }
        : inner.getUser(id);
    },
  };
}
