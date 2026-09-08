import type { CommerceRepo } from "../commerce/repo.ts";
import type { PricingQuoteRow } from "../commerce/types.ts";
import { AZ_PRO_PRODUCT_CODE, CURRENCY } from "../pricing/catalog.ts";
import {
  PADDLE_PROVIDER,
  buildPaddleTransactionPayload,
  createPaddleSdk,
  createPaddleTransaction,
  isPositiveCents,
  paddleLog,
  type PaddleCheckoutConfig,
  type PaddleTransactionsClient,
} from "./paddle.ts";

export async function ensurePaddleCheckout(opts: {
  repo: CommerceRepo;
  quote: PricingQuoteRow;
  config: PaddleCheckoutConfig;
  now?: Date;
  sdk?: PaddleTransactionsClient;
}): Promise<
  | { ok: true; transactionId: string; quoteId: string; finalPriceCents: number }
  | { ok: false; error: string; status: number }
> {
  const quote = opts.quote;
  if (quote.productCode !== AZ_PRO_PRODUCT_CODE) return { ok: false, error: "product_mismatch", status: 400 };
  if (quote.currency !== CURRENCY) return { ok: false, error: "currency_mismatch", status: 400 };
  if (!isPositiveCents(quote.finalPriceCents)) return { ok: false, error: "price_invalid", status: 400 };
  if (!quote.policyAcceptedAt) return { ok: false, error: "policy_required", status: 400 };

  const claimed = await opts.repo.claimCheckoutBinding({
    quoteId: quote.id,
    provider: PADDLE_PROVIDER,
    expiresAt: quote.expiresAt,
    now: (opts.now ?? new Date()).toISOString(),
  });

  if (!claimed.created) {
    if (claimed.binding.status === "ready" && claimed.binding.providerCheckoutId) {
      return {
        ok: true,
        transactionId: claimed.binding.providerCheckoutId,
        quoteId: quote.id,
        finalPriceCents: quote.finalPriceCents,
      };
    }
    paddleLog("checkout_in_progress", { quoteId: quote.id });
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }

  const payload = buildPaddleTransactionPayload({
    productId: opts.config.productId,
    finalPriceCents: quote.finalPriceCents,
    userId: quote.userId,
    quoteId: quote.id,
    productCode: quote.productCode,
  });

  const created = await createPaddleTransaction(
    opts.config,
    payload,
    opts.sdk ?? createPaddleSdk(opts.config)
  );
  if (!created.ok) {
    await opts.repo.releaseCheckoutClaim(quote.id);
    return { ok: false, error: created.error, status: 502 };
  }

  const finished = await opts.repo.completeCheckoutBinding({
    quoteId: quote.id,
    providerCheckoutId: created.id,
    checkoutUrl: created.checkoutUrl || `paddle-overlay:${created.id}`,
  });
  if (!finished?.providerCheckoutId) {
    paddleLog("checkout_complete_lost", { quoteId: quote.id });
    const existing = await opts.repo.getCheckoutBinding(quote.id);
    if (existing?.status === "ready" && existing.providerCheckoutId) {
      return {
        ok: true,
        transactionId: existing.providerCheckoutId,
        quoteId: quote.id,
        finalPriceCents: quote.finalPriceCents,
      };
    }
    await opts.repo.releaseCheckoutClaim(quote.id);
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }

  return {
    ok: true,
    transactionId: finished.providerCheckoutId,
    quoteId: quote.id,
    finalPriceCents: quote.finalPriceCents,
  };
}
