export type PromotionKind = "newcomer" | "referral_discount";
export type QuoteStatus = "open" | "consumed" | "expired" | "cancelled";
export type OrderStatus = "paid" | "refunded" | "refund_pending";
export type CreditStatus = "pending" | "available" | "reserved" | "redeemed" | "reversed";
export type RewardStatus = "pending" | "available" | "canceled" | "reversed";
export type RefundRequestStatus = "pending_manual" | "completed" | "rejected";
export type RefundReason =
  | "user_unused_refund"
  | "duplicate_charge"
  | "provider_initiated"
  | "chargeback"
  | "fraud"
  | "technical_failure"
  | "legal_required";

export type ReferralCodeRow = {
  userId: string;
  code: string;
  createdAt: string;
};

export type ReferralRelationshipRow = {
  id: string;
  referredUserId: string;
  referrerUserId: string;
  referralCode: string;
  createdAt: string;
  discountStatus: "available" | "redeemed";
  discountRedeemedAt: string | null;
  discountRedeemedOrderId: string | null;
};

export type PromotionRedemptionRow = {
  id: string;
  userId: string;
  kind: PromotionKind;
  orderId: string;
  redeemedAt: string;
};

export type ReferralRewardRow = {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  sourceOrderId: string;
  status: RewardStatus;
  createdAt: string;
  availableAt: string | null;
  canceledAt: string | null;
  creditId: string | null;
};

export type ReferralCreditRow = {
  id: string;
  userId: string;
  amountCents: number;
  sourceRewardId: string;
  status: CreditStatus;
  createdAt: string;
  availableAt: string | null;
  reservedAt: string | null;
  reservedQuoteId: string | null;
  reservedUntil: string | null;
  redeemedAt: string | null;
  redeemedOrderId: string | null;
  reversedAt: string | null;
  restoredAt: string | null;
  reversedAfterRedemption: boolean;
};

export type ReferralCreditDebtRow = {
  id: string;
  userId: string;
  sourceCreditId: string;
  sourceRewardId: string;
  sourceOrderId: string;
  amountCents: number;
  remainingCents: number;
  createdAt: string;
};

export type PricingQuoteRow = {
  id: string;
  userId: string;
  productCode: string;
  currency: string;
  listPriceCents: number;
  standardPriceCents: number;
  baseAppliedPriceCents: number;
  newcomerDiscountApplied: boolean;
  newcomerDiscountCents: number;
  referralDiscountApplied: boolean;
  referralDiscountCents: number;
  creditId: string | null;
  creditIds: string[];
  creditCents: number;
  subtotalCents: number;
  finalPriceCents: number;
  newcomerExpiresAt: string | null;
  referralRelationshipId: string | null;
  policyVersion: string;
  refundPolicyVersion: string;
  promotionPolicyVersion: string;
  policyAcceptedAt: string | null;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
  providerOrderId: string | null;
};

export type CommerceOrderRow = {
  id: string;
  userId: string;
  productCode: string;
  quoteId: string;
  entitlementId: string | null;
  status: OrderStatus;
  paidAt: string;
  amountCents: number;
  currency: string;
  provider: string;
  providerOrderId: string;
  newcomerApplied: boolean;
  referralDiscountApplied: boolean;
  creditId: string | null;
  creditIds: string[];
  creditCents: number;
  policyVersion: string;
  policyAcceptedAt: string | null;
  refundedAt: string | null;
  refundReason: RefundReason | null;
  createdAt: string;
};

export type ProUsageEventRow = {
  id: string;
  userId: string;
  entitlementId: string;
  orderId: string | null;
  featureCode: string;
  at: string;
};

export type RefundRequestRow = {
  id: string;
  userId: string;
  orderId: string;
  status: RefundRequestStatus;
  reason: RefundReason;
  createdAt: string;
  completedAt: string | null;
  note: string | null;
};

export type ClockUser = {
  id: string;
  createdAt: string;
};
