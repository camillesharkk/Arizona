import { EventName } from "@paddle/paddle-node-sdk";
import type { CommerceRepo } from "../commerce/repo.ts";
import type { GrantProFn } from "../commerce/service.ts";
import { confirmPaidOrder, quotedCreditsBoundToQuote } from "../commerce/service.ts";
import { AZ_PRO_PRODUCT_CODE, CURRENCY } from "../pricing/catalog.ts";
import {
  PADDLE_PROVIDER,
  expectedPaddleProductCode,
  isPaddleTransactionId,
  matchPaddleTransactionToQuote,
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
  productId?: string | null;
  unitPrice?: PaddleMoneyLike | null;
  billingCycle?: unknown;
};
type PaddleItemLike = { quantity?: number; price?: PaddlePriceLike | null };
type PaddleProductLike = { id?: string | null };
type PaddleLineLike = {
  quantity?: number;
  product?: PaddleProductLike | null;
  totals?: { discount?: string | null; subtotal?: string | null } | null;
};
type PaddleTxnLike = {
  id?: string;
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
}): Promise<PaddleWebhookResult> {
  const eventType = String(opts.event.eventType || "");
  const notificationId = opts.event.notificationId ? String(opts.event.notificationId) : undefined;

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
  if (custom.product_code !== expectedPaddleProductCode() || custom.product_code !== AZ_PRO_PRODUCT_CODE) {
    return fail(409, "product_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }
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
  if (productId !== opts.config.productId) {
    return fail(409, "product_id_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  }
  if (item.price?.billingCycle) {
    return fail(409, "subscription_not_allowed", { orderId: transactionId, quoteId: custom.quote_id });
  }

  const lineItems = txn.details?.lineItems || [];
  if (lineItems.length > 1) return fail(409, "item_count_mismatch", { orderId: transactionId, quoteId: custom.quote_id });
  const lineProductId = lineItems[0]?.product?.id ? String(lineItems[0].product.id) : "";
  if (lineProductId && lineProductId !== opts.config.productId) {
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
  if (quote.productCode !== AZ_PRO_PRODUCT_CODE) {
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

  const matched = matchPaddleTransactionToQuote(txn, quote, opts.config.productId);
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
    const result = await confirmPaidOrder(opts.repo, {
      userId: quote.userId,
      quoteId: quote.id,
      provider: PADDLE_PROVIDER,
      providerOrderId: transactionId,
      grantPro: opts.grantPro,
      boundFulfillment: true,
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
    reportPaddleFulfillment({
      userId: quote.userId,
      duplicate: Boolean(result.duplicate),
      orderConfirmed: true,
      entitlementId: result.order.entitlementId,
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
    reportPaddleFulfillment({
      userId: quote.userId,
      duplicate: false,
      orderConfirmed: false,
      entitlementFailed: true,
    });
    return fail(503, "entitlement_failed", { orderId: transactionId, quoteId: quote.id });
  }
}
