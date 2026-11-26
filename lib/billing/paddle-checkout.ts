import type { StateCode } from "@/lib/types";
import type { CommerceRepo } from "../commerce/repo.ts";
import type { PricingQuoteRow } from "../commerce/types.ts";
import { assertQuoteStillValid } from "../commerce/service.ts";
import { CURRENCY } from "../pricing/catalog.ts";
import { isLifetimeProProduct, isPurchasableProProduct } from "../pro-products.ts";
import {
  PADDLE_PROVIDER,
  buildPaddleTransactionPayload,
  createPaddleSdk,
  createPaddleTransaction,
  isPositiveCents,
  matchPaddleTransactionToQuote,
  paddleCatalogForProduct,
  paddleLog,
  validatePaddleLifetimePrice,
  type PaddleCheckoutConfig,
  type PaddleTransactionsClient,
} from "./paddle.ts";
import { reconcilePaddleCheckoutBinding } from "./paddle-reconcile.ts";
import { reportCheckoutCreate } from "../analytics-server.ts";

export async function ensurePaddleCheckout(opts: {
  repo: CommerceRepo;
  quote: PricingQuoteRow;
  config: PaddleCheckoutConfig;
  now?: Date;
  sdk?: PaddleTransactionsClient;
  sourceState?: StateCode;
  checkoutAttemptId?: string;
  resumeDepth?: number;
}): Promise<
  | { ok: true; transactionId: string; quoteId: string; finalPriceCents: number; checkoutUrl: string | null; paymentPending?: boolean }
  | { ok: false; error: string; status: number }
> {
  const quote = opts.quote;
  if (!isPurchasableProProduct(quote.productCode)) {
    return { ok: false, error: "product_mismatch", status: 400 };
  }
  const catalog = paddleCatalogForProduct(opts.config, quote.productCode);
  if (!catalog) return { ok: false, error: "LIFETIME_PRODUCT_UNAVAILABLE", status: 503 };
  if (quote.currency !== CURRENCY) return { ok: false, error: "currency_mismatch", status: 400 };
  if (!isPositiveCents(quote.finalPriceCents)) return { ok: false, error: "price_invalid", status: 400 };
  if (!quote.policyAcceptedAt) return { ok: false, error: "policy_required", status: 400 };

  const now = opts.now ?? new Date();
  const sdk = opts.sdk ?? createPaddleSdk(opts.config);

  const recon = await reconcilePaddleCheckoutBinding({
    repo: opts.repo,
    quote,
    config: opts.config,
    now,
    sdk,
  });
  if (!recon.ok) return { ok: false, error: recon.error, status: recon.status };
  if (recon.kind === "ready") {
    const bound = await opts.repo.getCheckoutBinding(quote.id);
    return {
      ok: true,
      transactionId: recon.transactionId,
      quoteId: quote.id,
      finalPriceCents: quote.finalPriceCents,
      checkoutUrl: bound?.checkoutUrl ?? null,
      paymentPending: recon.paymentPending,
    };
  }
  if (recon.kind === "in_progress") {
    paddleLog("checkout_in_progress", { quoteId: quote.id });
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }
  if (recon.kind === "cleared" && recon.quoteExpired) {
    return { ok: false, error: "expired", status: 400 };
  }

  const valid = await assertQuoteStillValid(opts.repo, quote, now);
  if (!valid.ok) {
    return { ok: false, error: valid.error, status: valid.error === "PRICE_CHANGED" ? 409 : 400 };
  }

  const claimed = await opts.repo.claimCheckoutBinding({
    quoteId: quote.id,
    provider: PADDLE_PROVIDER,
    expiresAt: quote.expiresAt,
    now: (opts.now ?? new Date()).toISOString(),
  });

  if ("error" in claimed) {
    if (claimed.quoteId && (opts.resumeDepth ?? 0) < 5) {
      const previous = await opts.repo.getQuote(claimed.quoteId);
      const binding = await opts.repo.getCheckoutBinding(claimed.quoteId);
      if (previous?.userId === quote.userId && binding?.provider === PADDLE_PROVIDER) {
        const previousReconciliation = await reconcilePaddleCheckoutBinding({ ...opts, quote: previous, sdk, now });
        if (!previousReconciliation.ok) return previousReconciliation;
        if (previousReconciliation.kind === "cleared" || previousReconciliation.kind === "none") {
          return ensurePaddleCheckout({ ...opts, resumeDepth: (opts.resumeDepth ?? 0) + 1 });
        }
        return ensurePaddleCheckout({ ...opts, quote: previous, resumeDepth: (opts.resumeDepth ?? 0) + 1 });
      }
    }
    const error = claimed.error === "lifetime_checkout_in_progress" ? "checkout_in_progress" : claimed.error;
    return { ok: false, error, status: 409 };
  }

  if (!claimed.created) {
    if (claimed.binding.status === "ready" && claimed.binding.providerCheckoutId) {
      if (isLifetimeProProduct(quote.productCode)) {
        // A concurrent caller may have completed this binding since we first checked it.
        return { ok: false, error: "checkout_in_progress", status: 409 };
      }
      return {
        ok: true,
        transactionId: claimed.binding.providerCheckoutId,
        quoteId: quote.id,
        finalPriceCents: quote.finalPriceCents,
        checkoutUrl: claimed.binding.checkoutUrl,
      };
    }
    paddleLog("checkout_in_progress", { quoteId: quote.id });
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }

  const expectedCreatedAt = claimed.binding.createdAt;
  if (catalog.priceId && !await validatePaddleLifetimePrice(sdk, { ...catalog, priceId: catalog.priceId })) {
    // No provider transaction was attempted, so another checkout may safely retry this quote.
    await opts.repo.releaseCheckoutClaim(quote.id, expectedCreatedAt);
    return { ok: false, error: "LIFETIME_PRODUCT_UNAVAILABLE", status: 503 };
  }
  const payload = buildPaddleTransactionPayload({
    ...catalog,
    finalPriceCents: quote.finalPriceCents,
    userId: quote.userId,
    quoteId: quote.id,
    productCode: quote.productCode,
    sourceState: opts.sourceState,
    checkoutAttemptId: opts.checkoutAttemptId,
  });

  const created = await createPaddleTransaction(opts.config, payload, sdk);
  if (!created.ok) {
    reportCheckoutCreate(false, quote.userId);
    return { ok: false, error: created.error, status: 502 };
  }
  if (catalog.priceId) {
    const matched = matchPaddleTransactionToQuote(created.transaction, quote, catalog.productId, catalog.priceId);
    if (!matched.ok) {
      // Keep this provider ID bound until reconciliation can verify or confirm cancellation.
      await opts.repo.completeCheckoutBinding({
        quoteId: quote.id,
        providerCheckoutId: created.id,
        checkoutUrl: null,
        expectedCreatedAt,
      });
      paddleLog(matched.error, { quoteId: quote.id, orderId: created.id });
      reportCheckoutCreate(false, quote.userId);
      return { ok: false, error: "LIFETIME_PRODUCT_UNAVAILABLE", status: 503 };
    }
  }
  reportCheckoutCreate(true, quote.userId);

  const finished = await opts.repo.completeCheckoutBinding({
    quoteId: quote.id,
    providerCheckoutId: created.id,
    checkoutUrl: created.checkoutUrl || `paddle-overlay:${created.id}`,
    expectedCreatedAt,
  });
  if (!finished?.providerCheckoutId) {
    paddleLog("checkout_complete_lost", { quoteId: quote.id, orderId: created.id });
    if (catalog.priceId) return { ok: false, error: "checkout_in_progress", status: 409 };
    const current = await opts.repo.getCheckoutBinding(quote.id);
    if (current?.status === "ready" && current.providerCheckoutId) {
      return {
        ok: true,
        transactionId: current.providerCheckoutId,
        quoteId: quote.id,
        finalPriceCents: quote.finalPriceCents,
        checkoutUrl: current.checkoutUrl,
      };
    }
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }

  return {
    ok: true,
    transactionId: finished.providerCheckoutId,
    quoteId: quote.id,
    finalPriceCents: quote.finalPriceCents,
    checkoutUrl: finished.checkoutUrl,
  };
}
