import { EventName } from "@paddle/paddle-node-sdk";
import type { CommerceRepo } from "../commerce/repo.ts";
import type { GrantProFn, RefundEntitlementFn } from "../commerce/service.ts";
import { completeNonRestoringRefund, confirmPaidOrder, quotedCreditsBoundToQuote } from "../commerce/service.ts";
import { CURRENCY } from "../pricing/catalog.ts";
import { isLifetimeProProduct, isPurchasableProProduct } from "../pro-products.ts";
import {
  PADDLE_PROVIDER,
  isPaddleTransactionId,
  matchPaddleTransactionToQuote,
  paddleCatalogForProduct,
  paddleLog,
  paddleUnitPriceMatchesQuote,
  type PaddleWebhookConfig,
} from "./paddle.ts";
import { adoptPaddleCreatingBinding } from "./paddle-reconcile.ts";
import { reportPaddleFulfillment } from "../analytics-server.ts";

export type PaddleWebhookResult = {
  status: number;
  body: Record<string, unknown>;
  recordNotificationId?: string;
};

type PaddleMoneyLike = { amount?: string | null; currencyCode?: string | null };
type PaddlePriceLike = {
  id?: string | null;
  productId?: string | null;
  unitPrice?: PaddleMoneyLike | null;
  billingCycle?: unknown;
};
type PaddleItemLike = { quantity?: number; price?: PaddlePriceLike | null; type?: string | null };
type PaddleProductLike = { id?: string | null };
type PaddleLineLike = {
  priceId?: string | null;
  quantity?: number;
  product?: PaddleProductLike | null;
  totals?: { discount?: string | null; subtotal?: string | null } | null;
};
type PaddleTxnLike = {
  id?: string;
  transactionId?: string | null;
  action?: string | null;
  type?: string | null;
  totals?: { subtotal?: string | null } | null;
  status?: string;
  currencyCode?: string;
  discountId?: string | null;
  customerId?: string | null;
  customData?: Record<string, unknown> | null;
  items?: PaddleItemLike[] | null;
  details?: {
    totals?: { discount?: string | null; subtotal?: string | null } | null;
    lineItems?: PaddleLineLike[] | null;
  } | null;
};

export type PaddleWebhookEventLike = {
  eventType?: string;
  notificationId?: string | null;
  eventId?: string;
  data?: PaddleTxnLike;
};

export function paddleWebhookWriteScope(event: PaddleWebhookEventLike, config: PaddleWebhookConfig) {
  const data = event.data;
  if (!data || !config.lifetimePriceId) return null;
  if ((event.eventType === "adjustment.created" || event.eventType === "adjustment.updated") && isPaddleTransactionId(data.transactionId || "")) {
    return { transactionId: data.transactionId!, userId: "" };
  }
  const custom = readCustom(data);
  if (event.eventType === "transaction.completed" && isLifetimeProProduct(custom.product_code) && isPaddleTransactionId(data.id || "")) {
    return { transactionId: data.id!, userId: custom.user_id };
  }
  return null;
}

function fail(status: number, error: string, extra?: Record<string, unknown>): PaddleWebhookResult {
  paddleLog(error, extra);
  return { status, body: { ok: false, error, ...extra } };
}

function ok(body: Record<string, unknown>, extra?: { recordNotificationId?: string }): PaddleWebhookResult {
  return { status: 200, body, recordNotificationId: extra?.recordNotificationId };
}

function readCustom(data: PaddleTxnLike) {
  const raw = data.customData && typeof data.customData === "object" ? data.customData : {};
  return {
    user_id: String(raw.user_id || "").trim(),
    quote_id: String(raw.quote_id || "").trim(),
    product_code: String(raw.product_code || "").trim(),
  };
}

function discountAmount(value: string | null | undefined) {
  if (value == null || value === "") return "0";
  return String(value);
}

function hasPaddleDiscount(txn: PaddleTxnLike) {
  if (txn.discountId) return true;
  if (discountAmount(txn.details?.totals?.discount) !== "0") return true;
  const lines = txn.details?.lineItems || [];
  return lines.some((line) => discountAmount(line.totals?.discount) !== "0");
}

export async function handlePaddleWebhook(opts: {
  repo: CommerceRepo;
  config: PaddleWebhookConfig;
  event: PaddleWebhookEventLike;
  grantPro: GrantProFn;
  refundEntitlement?: RefundEntitlementFn;
  report?: typeof reportPaddleFulfillment;
}): Promise<PaddleWebhookResult> {
  const report = opts.report ?? reportPaddleFulfillment;
  const eventType = String(opts.event.eventType || "");
  const notificationId = opts.event.notificationId ? String(opts.event.notificationId) : undefined;

  if (eventType === "adjustment.created" || eventType === "adjustment.updated") {
    const adjustment = opts.event.data;
    if (!adjustment || adjustment.status !== "approved") return ok({ ok: true, ignored: true });
    if (adjustment.action === "refund" && adjustment.items?.length && adjustment.items.every(item => item.type === "tax")) {
      return ok({ ok: true, ignored: true, reason: "tax_adjustment" });
    }
    const chargeback = adjustment.action === "chargeback";
    const onlyLineFullyRefunded = adjustment.items?.some(item => item.type === "full") === true;
    const fullRefund = adjustment.action === "refund" && (adjustment.type === "full" || onlyLineFullyRefunded);
    const partialRefund = adjustment.action === "refund" && adjustment.type === "partial" && !fullRefund;
    const disputeReview = adjustment.action === "chargeback_reverse" || adjustment.action === "chargeback_warning";
    if (!chargeback && !fullRefund && !partialRefund && !disputeReview) return ok({ ok: true, ignored: true });
    const transactionId = adjustment.transactionId || "";
    if (!isPaddleTransactionId(transactionId)) return fail(409, "transaction_id_invalid");
    try {
      const order = await opts.repo.getOrderByProvider(PADDLE_PROVIDER, transactionId);
      if (order && !isLifetimeProProduct(order.productCode)) return ok({ ok: true, ignored: true });
      if (partialRefund || disputeReview) {
        if (!order) return ok({ ok: true, ignored: true });
        if (disputeReview) paddleLog("lifetime_dispute_manual_review", { event: eventType, orderId: transactionId });
        return ok({
          ok: true, lifetimeAccessUnchanged: true, manualReview: disputeReview,
        }, { recordNotificationId: notificationId });
      }
      if (!order) {
        const binding = await opts.repo.getCheckoutBindingByProviderId(PADDLE_PROVIDER, transactionId);
        const quote = binding && await opts.repo.getQuote(binding.quoteId);
        if ((quote && !isLifetimeProProduct(quote.productCode)) || (!quote && !opts.config.lifetimePriceId)) {
          return ok({ ok: true, ignored: true });
        }
      }
      if (!opts.refundEntitlement) return fail(503, "refund_handler_unavailable");
      // Receipt first: if completion is in flight, it will see this even before the order is available here.
      const reason = chargeback ? "chargeback" : "provider_initiated";
      await opts.repo.rememberProviderRefund(PADDLE_PROVIDER, transactionId, reason);
      const current = order ?? await opts.repo.getOrderByProvider(PADDLE_PROVIDER, transactionId);
      if (current && isLifetimeProProduct(current.productCode) && current.status !== "refunded") {
        const refund = await completeNonRestoringRefund(opts.repo, {
          userId: current.userId, orderId: current.id,
          reason,
          refundEntitlement: opts.refundEntitlement,
        });
        if (!refund.ok && refund.error !== "already_refunded") throw new Error(refund.error);
      }
      return ok({ ok: true, refunded: Boolean(current), refundPending: !current }, { recordNotificationId: notificationId });
    } catch {
      return fail(503, "refund_failed", { orderId: transactionId });
    }
  }

  if (eventType !== EventName.TransactionCompleted && eventType !== "transaction.completed") {
    return ok({ ok: true, ignored: true, event: eventType });
  }

  const txn = opts.event.data;
  if (!txn || typeof txn !== "object") return fail(409, "transaction_missing");
  if (String(txn.status || "") !== "completed") {
    return ok({ ok: true, ignored: true, event: eventType, reason: "status_not_completed" });
  }

  const transactionId = String(txn.id || "");
  if (!isPaddleTransactionId(transactionId)) return fail(409, "transaction_id_invalid", { event: eventType });

  const custom = readCustom(txn);
  if (!isPurchasableProProduct(custom.product_code)) {
    return fail(409, "product_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }
  const catalog = paddleCatalogForProduct(opts.config, custom.product_code);
  if (!catalog) return fail(503, "LIFETIME_PRODUCT_UNAVAILABLE");
  const expectedProductId = catalog.productId;
  if (!custom.quote_id || !custom.user_id) {
    return fail(409, "custom_data_missing", { orderId: transactionId });
  }

  if (String(txn.currencyCode || "") !== CURRENCY) {
    return fail(409, "currency_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }

  const items = Array.isArray(txn.items) ? txn.items : [];
  if (items.length !== 1) return fail(409, "item_count_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  const item = items[0];
  if (Number(item.quantity) !== 1) return fail(409, "quantity_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  const productId = String(item.price?.productId || "");
  if (productId !== expectedProductId) {
    return fail(409, "product_id_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }
  if (item.price?.billingCycle) {
    return fail(409, "subscription_not_allowed", { orderId: transactionId, quoteId: custom.quote_id });
  }

  const lineItems = txn.details?.lineItems || [];
  if (lineItems.length > 1) return fail(409, "item_count_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  const lineProductId = lineItems[0]?.product?.id ? String(lineItems[0].product.id) : "";
  if (lineProductId && lineProductId !== expectedProductId) {
    return fail(409, "product_id_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }
  if (lineItems[0] && Number(lineItems[0].quantity) !== 1) {
    return fail(409, "quantity_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }

  if (hasPaddleDiscount(txn)) {
    return fail(409, "paddle_discount_not_allowed", { orderId: transactionId, quoteId: custom.quote_id });
  }

  const quote = await opts.repo.getQuote(custom.quote_id);
  if (!quote) return fail(409, "quote_not_found", { orderId: transactionId, quoteId: custom.quote_id });
  if (quote.userId !== custom.user_id) {
    return fail(409, "user_mismatch", { orderId: transactionId, quoteId: quote.id });
  }
  if (quote.productCode !== custom.product_code) {
    return fail(409, "product_mismatch", { orderId: transactionId, quoteId: quote.id });
  }
  if (quote.currency !== CURRENCY) {
    return fail(409, "currency_mismatch", { orderId: transactionId, quoteId: quote.id });
  }
  if (!paddleUnitPriceMatchesQuote(item.price?.unitPrice?.amount, quote.finalPriceCents)) {
    return fail(409, "amount_mismatch", { orderId: transactionId, quoteId: quote.id });
  }
  if (item.price?.unitPrice?.currencyCode && item.price.unitPrice.currencyCode !== CURRENCY) {
    return fail(409, "currency_mismatch", { orderId: transactionId, quoteId: quote.id });
  }

  const matched = matchPaddleTransactionToQuote(txn, quote, expectedProductId, catalog.priceId);
  if (!matched.ok) return fail(409, matched.error, { orderId: transactionId, quoteId: quote.id });

  const held = await quotedCreditsBoundToQuote(opts.repo, quote);
  if (!held.ok) return fail(409, held.error, { orderId: transactionId, quoteId: quote.id });

  let byQuote = await opts.repo.getCheckoutBinding(quote.id);
  let byTxn = await opts.repo.getCheckoutBindingByProviderId(PADDLE_PROVIDER, transactionId);
  const readyForTxn =
    byQuote?.provider === PADDLE_PROVIDER &&
    byTxn?.provider === PADDLE_PROVIDER &&
    byQuote.status === "ready" &&
    byTxn.status === "ready" &&
    byQuote.quoteId === quote.id &&
    byTxn.quoteId === quote.id &&
    byQuote.providerCheckoutId === transactionId &&
    byTxn.providerCheckoutId === transactionId;

  if (!readyForTxn) {
    const adoptable =
      byQuote?.provider === PADDLE_PROVIDER &&
      byQuote.status === "creating" &&
      !byQuote.providerCheckoutId &&
      !byTxn;
    if (adoptable) {
      const adopted = await adoptPaddleCreatingBinding({
        repo: opts.repo,
        quoteId: quote.id,
        transactionId,
      });
      byQuote = adopted ?? (await opts.repo.getCheckoutBinding(quote.id));
      byTxn = await opts.repo.getCheckoutBindingByProviderId(PADDLE_PROVIDER, transactionId);
    } else if (
      byQuote?.provider === PADDLE_PROVIDER &&
      byQuote.status === "creating" &&
      byQuote.providerCheckoutId === transactionId
    ) {
      await opts.repo.completeCheckoutBinding({
        quoteId: quote.id,
        providerCheckoutId: transactionId,
        checkoutUrl: `paddle-overlay:${transactionId}`,
      });
      byQuote = await opts.repo.getCheckoutBinding(quote.id);
      byTxn = await opts.repo.getCheckoutBindingByProviderId(PADDLE_PROVIDER, transactionId);
    }
  }

  if (
    byQuote?.provider === PADDLE_PROVIDER &&
    byTxn?.provider === PADDLE_PROVIDER &&
    byQuote.status === "ready" &&
    byTxn.status === "ready" &&
    byQuote.quoteId === quote.id &&
    byTxn.quoteId === quote.id &&
    byQuote.providerCheckoutId === transactionId &&
    byTxn.providerCheckoutId === transactionId
  ) {
    // adopted or already ready — continue fulfillment
  } else if (byQuote?.status === "creating" || byTxn?.status === "creating") {
    return fail(503, "checkout_in_progress", { orderId: transactionId, quoteId: quote.id });
  } else if (!byQuote || !byTxn) {
    return fail(409, "checkout_binding_missing", { orderId: transactionId, quoteId: quote.id });
  } else {
    return fail(409, "checkout_binding_mismatch", { orderId: transactionId, quoteId: quote.id });
  }

  const taken = await opts.repo.getOrderByProvider(PADDLE_PROVIDER, transactionId);
  if (taken && taken.userId !== quote.userId) {
    return fail(409, "provider_order_conflict", { orderId: transactionId, quoteId: quote.id });
  }

  try {
    const priorLifetimeRefund = catalog.priceId
      ? await opts.repo.getProviderRefundReason(PADDLE_PROVIDER, transactionId)
      : null;
    const result = await confirmPaidOrder(opts.repo, {
      userId: quote.userId,
      quoteId: quote.id,
      provider: PADDLE_PROVIDER,
      providerOrderId: transactionId,
      grantPro: opts.grantPro,
      boundFulfillment: true,
      priorLifetimeRefund,
    });
    if (!result.ok) {
      if (result.error === "quote_consumed" || result.error === "expired" || result.error === "PRICE_CHANGED") {
        const existing = await opts.repo.getOrderByProvider(PADDLE_PROVIDER, transactionId);
        if (existing) {
          return ok(
            { ok: true, duplicate: true, orderId: existing.id },
            { recordNotificationId: notificationId }
          );
        }
      }
      if (result.error === "credit_conflict") {
        return fail(409, "credit_conflict", { orderId: transactionId, quoteId: quote.id });
      }
      paddleLog("order_confirm_failed", { orderId: transactionId, quoteId: quote.id, event: result.error });
      return fail(503, result.error, { orderId: transactionId, quoteId: quote.id });
    }
    const refundReason = priorLifetimeRefund ?? (catalog.priceId
      ? await opts.repo.getProviderRefundReason(PADDLE_PROVIDER, transactionId)
      : null);
    if (refundReason) {
      if (result.order.status !== "refunded") {
        if (!opts.refundEntitlement) return fail(503, "refund_handler_unavailable");
        const refund = await completeNonRestoringRefund(opts.repo, {
          userId: result.order.userId, orderId: result.order.id, reason: refundReason,
          refundEntitlement: opts.refundEntitlement,
        });
        if (!refund.ok && refund.error !== "already_refunded") throw new Error(refund.error);
      }
      return ok({ ok: true, refunded: true, orderId: result.order.id }, { recordNotificationId: notificationId });
    }
    await report({
      userId: quote.userId,
      duplicate: Boolean(result.duplicate),
      orderConfirmed: true,
      entitlementId: result.order.entitlementId,
      transactionId,
      orderId: result.order.id,
      amountCents: result.order.amountCents,
    });
    return ok(
      {
        ok: true,
        duplicate: Boolean(result.duplicate),
        orderId: result.order.id,
        quoteId: quote.id,
      },
      { recordNotificationId: notificationId }
    );
  } catch {
    paddleLog("order_confirm_exception", { orderId: transactionId, quoteId: quote.id });
    await report({
      userId: quote.userId,
      duplicate: false,
      orderConfirmed: false,
      entitlementFailed: true,
      transactionId,
    });
    return fail(503, "entitlement_failed", { orderId: transactionId, quoteId: quote.id });
  }
}
