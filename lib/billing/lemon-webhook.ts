import type { CommerceRepo } from "../commerce/repo.ts";
import type { GrantProFn, RefundEntitlementFn } from "../commerce/service.ts";
import {
  completeEligibleUnusedRefund,
  completeNonRestoringRefund,
  confirmPaidOrder,
} from "../commerce/service.ts";
import { AZ_PRO_PRODUCT_CODE } from "../pricing/catalog.ts";
import {
  LEMON_PROVIDER,
  lemonLog,
  lemonProductAmountMatchesQuote,
  parseLemonOrderEvent,
  resolveLemonEventName,
  type LemonConfig,
  type LemonOrderFields,
} from "./lemonsqueezy.ts";

export type LemonWebhookResult = {
  status: number;
  body: Record<string, unknown>;
};

function fail(status: number, error: string, extra?: Record<string, unknown>): LemonWebhookResult {
  lemonLog(error, extra);
  return { status, body: { ok: false, error, ...extra } };
}

function ok(body: Record<string, unknown>, status = 200): LemonWebhookResult {
  return { status, body };
}

async function handleOrderCreated(
  repo: CommerceRepo,
  config: LemonConfig,
  order: LemonOrderFields,
  grantPro: GrantProFn
): Promise<LemonWebhookResult> {
  if (order.storeId !== Number(config.storeId)) {
    return fail(409, "store_mismatch", { orderId: order.orderId });
  }
  if (order.variantId !== Number(config.variantId)) {
    return fail(409, "variant_mismatch", { orderId: order.orderId });
  }
  if (order.testMode !== config.testMode) {
    return fail(409, "test_live_mismatch", { orderId: order.orderId });
  }
  if (order.status !== "paid") {
    return fail(409, "order_not_paid", { orderId: order.orderId });
  }
  if (order.currency !== "USD") {
    return fail(409, "currency_mismatch", { orderId: order.orderId, quoteId: order.custom.quote_id });
  }
  if (order.custom.product_code !== AZ_PRO_PRODUCT_CODE) {
    return fail(409, "product_mismatch", { orderId: order.orderId, quoteId: order.custom.quote_id });
  }
  if (!order.custom.user_id || !order.custom.quote_id) {
    return fail(409, "custom_data_missing", { orderId: order.orderId });
  }
  if (!Number.isFinite(order.discountTotal) || order.discountTotal !== 0) {
    return fail(409, "lemon_discount_not_allowed", { orderId: order.orderId, quoteId: order.custom.quote_id });
  }

  const quote = await repo.getQuote(order.custom.quote_id);
  if (!quote) return fail(409, "quote_not_found", { orderId: order.orderId, quoteId: order.custom.quote_id });
  if (quote.userId !== order.custom.user_id) {
    return fail(409, "user_mismatch", { orderId: order.orderId, quoteId: quote.id });
  }
  if (quote.id !== order.custom.quote_id) {
    return fail(409, "quote_mismatch", { orderId: order.orderId, quoteId: quote.id });
  }
  if (quote.currency !== order.currency) {
    return fail(409, "currency_mismatch", { orderId: order.orderId, quoteId: quote.id });
  }
  if (quote.productCode !== AZ_PRO_PRODUCT_CODE) {
    return fail(409, "product_mismatch", { orderId: order.orderId, quoteId: quote.id });
  }
  if (!lemonProductAmountMatchesQuote(order, quote.finalPriceCents)) {
    return fail(409, "amount_mismatch", { orderId: order.orderId, quoteId: quote.id });
  }

  const taken = await repo.getOrderByProvider(LEMON_PROVIDER, order.orderId);
  if (taken && taken.userId !== quote.userId) {
    return fail(409, "provider_order_conflict", { orderId: order.orderId, quoteId: quote.id });
  }

  try {
    const result = await confirmPaidOrder(repo, {
      userId: quote.userId,
      quoteId: quote.id,
      provider: LEMON_PROVIDER,
      providerOrderId: order.orderId,
      grantPro,
    });
    if (!result.ok) {
      if (result.error === "quote_consumed" || result.error === "expired" || result.error === "PRICE_CHANGED") {
        const existing = await repo.getOrderByProvider(LEMON_PROVIDER, order.orderId);
        if (existing) return ok({ ok: true, duplicate: true, orderId: existing.id });
      }
      lemonLog("order_confirm_failed", { orderId: order.orderId, quoteId: quote.id, event: result.error });
      return fail(503, result.error, { orderId: order.orderId, quoteId: quote.id });
    }
    return ok({
      ok: true,
      duplicate: Boolean(result.duplicate),
      orderId: result.order.id,
      quoteId: quote.id,
    });
  } catch {
    lemonLog("order_confirm_exception", { orderId: order.orderId, quoteId: quote.id });
    return fail(503, "entitlement_failed", { orderId: order.orderId, quoteId: quote.id });
  }
}

function isFullRefund(order: LemonOrderFields) {
  return order.refunded === true || order.status === "refunded";
}

function isPartialRefund(order: LemonOrderFields) {
  return order.status === "partial_refund" || (order.status !== "refunded" && order.refunded === false && order.eventName === "order_refunded");
}

async function handleOrderRefunded(
  repo: CommerceRepo,
  config: LemonConfig,
  order: LemonOrderFields,
  refundEntitlement: RefundEntitlementFn
): Promise<LemonWebhookResult> {
  if (order.storeId !== Number(config.storeId)) {
    return fail(409, "store_mismatch", { orderId: order.orderId });
  }
  const commerce = await repo.getOrderByProvider(LEMON_PROVIDER, order.orderId);
  if (!commerce) {
    lemonLog("provider_order_not_found", { orderId: order.orderId, event: "order_refunded" });
    return fail(503, "provider_order_not_found", { orderId: order.orderId });
  }

  if (isPartialRefund(order) && !isFullRefund(order)) {
    lemonLog("partial_refund_manual_review", { orderId: order.orderId, quoteId: commerce.quoteId });
    return ok({ ok: true, warning: "partial_refund_manual_review", orderId: commerce.id });
  }
  if (!isFullRefund(order)) {
    lemonLog("refund_status_unrecognized", { orderId: order.orderId });
    return ok({ ok: true, warning: "partial_refund_manual_review", orderId: commerce.id });
  }

  if (commerce.status === "refunded") {
    return ok({ ok: true, duplicate: true, orderId: commerce.id });
  }

  const requests = await repo.listRefundRequests(commerce.userId);
  const pendingUnused = requests.find(
    (r) => r.orderId === commerce.id && r.status === "pending_manual" && r.reason === "user_unused_refund"
  );

  try {
    if (pendingUnused) {
      const done = await completeEligibleUnusedRefund(repo, {
        userId: commerce.userId,
        orderId: commerce.id,
        refundEntitlement,
      });
      if (!done.ok) {
        const providerPath = await completeNonRestoringRefund(repo, {
          userId: commerce.userId,
          orderId: commerce.id,
          reason: "provider_initiated",
          refundEntitlement,
        });
        if (!providerPath.ok && providerPath.error !== "already_refunded") {
          return fail(503, providerPath.error, { orderId: order.orderId, quoteId: commerce.quoteId });
        }
        return ok({ ok: true, path: "provider_initiated", orderId: commerce.id });
      }
      await repo.completeRefundRequest(pendingUnused.id, new Date().toISOString());
      return ok({ ok: true, path: "user_unused_refund", orderId: commerce.id });
    }

    const providerPath = await completeNonRestoringRefund(repo, {
      userId: commerce.userId,
      orderId: commerce.id,
      reason: "provider_initiated",
      refundEntitlement,
    });
    if (!providerPath.ok && providerPath.error !== "already_refunded") {
      return fail(503, providerPath.error, { orderId: order.orderId, quoteId: commerce.quoteId });
    }
    return ok({ ok: true, path: "provider_initiated", duplicate: providerPath.error === "already_refunded", orderId: commerce.id });
  } catch {
    lemonLog("refund_exception", { orderId: order.orderId, quoteId: commerce.quoteId });
    return fail(503, "refund_failed", { orderId: order.orderId, quoteId: commerce.quoteId });
  }
}

export async function handleLemonWebhook(opts: {
  raw: string;
  headerEventName: string | null;
  repo: CommerceRepo;
  config: LemonConfig;
  body: unknown;
  grantPro: GrantProFn;
  refundEntitlement: RefundEntitlementFn;
}): Promise<LemonWebhookResult> {
  const root = opts.body as { meta?: { event_name?: unknown } };
  const names = resolveLemonEventName(opts.headerEventName, root?.meta?.event_name);
  if (!names.ok) return fail(400, names.error);

  if (names.eventName === "dispute_created" || names.eventName === "dispute_resolved") {
    lemonLog("dispute_manual_review", { event: names.eventName });
    return ok({ ok: true, ignored: true, review: "manual_review", event: names.eventName });
  }

  if (names.eventName !== "order_created" && names.eventName !== "order_refunded") {
    return ok({ ok: true, ignored: true, event: names.eventName });
  }

  const parsed = parseLemonOrderEvent(opts.body, names.eventName);
  if (!parsed.ok) return fail(409, parsed.error, { event: names.eventName });
  if (!parsed.order.orderId) return fail(409, "order_id_missing");

  if (names.eventName === "order_created") {
    return handleOrderCreated(opts.repo, opts.config, parsed.order, opts.grantPro);
  }
  return handleOrderRefunded(opts.repo, opts.config, parsed.order, opts.refundEntitlement);
}
