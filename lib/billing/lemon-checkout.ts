import type { CommerceRepo } from "../commerce/repo.ts";
import type { PricingQuoteRow } from "../commerce/types.ts";
import { AZ_PRO_PRODUCT_CODE, CURRENCY } from "../pricing/catalog.ts";
import { siteUrl } from "../site.ts";
import {
  LEMON_PROVIDER,
  buildLemonCheckoutPayload,
  checkoutExpiryIso,
  createLemonCheckout,
  lemonLog,
  lemonRedirectUrl,
  type LemonConfig,
} from "./lemonsqueezy.ts";

export async function ensureLemonCheckout(opts: {
  repo: CommerceRepo;
  quote: PricingQuoteRow;
  email: string;
  config: LemonConfig;
  now?: Date;
  fetchFn?: typeof fetch;
}): Promise<
  | { ok: true; url: string; quoteId: string; finalPriceCents: number }
  | { ok: false; error: string; status: number }
> {
  const quote = opts.quote;
  if (quote.productCode !== AZ_PRO_PRODUCT_CODE) return { ok: false, error: "product_mismatch", status: 400 };
  if (quote.currency !== CURRENCY) return { ok: false, error: "currency_mismatch", status: 400 };
  if (!quote.policyAcceptedAt) return { ok: false, error: "policy_required", status: 400 };

  const claimed = await opts.repo.claimCheckoutBinding({
    quoteId: quote.id,
    provider: LEMON_PROVIDER,
    expiresAt: quote.expiresAt,
    now: (opts.now ?? new Date()).toISOString(),
  });

  if (!claimed.created) {
    if (claimed.binding.status === "ready" && claimed.binding.checkoutUrl) {
      return {
        ok: true,
        url: claimed.binding.checkoutUrl,
        quoteId: quote.id,
        finalPriceCents: quote.finalPriceCents,
      };
    }
    lemonLog("checkout_in_progress", { quoteId: quote.id });
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }

  const payload = buildLemonCheckoutPayload({
    storeId: opts.config.storeId,
    variantId: opts.config.variantId,
    customPriceCents: quote.finalPriceCents,
    email: opts.email,
    userId: quote.userId,
    quoteId: quote.id,
    productCode: quote.productCode,
    expiresAt: checkoutExpiryIso(quote.expiresAt),
    redirectUrl: lemonRedirectUrl(siteUrl()),
    testMode: opts.config.testMode,
  });

  const created = await createLemonCheckout(opts.config, payload, opts.fetchFn);
  if (!created.ok) {
    await opts.repo.releaseCheckoutClaim(quote.id);
    return { ok: false, error: created.error, status: 502 };
  }

  const finished = await opts.repo.completeCheckoutBinding({
    quoteId: quote.id,
    providerCheckoutId: created.id,
    checkoutUrl: created.url,
  });
  if (!finished?.checkoutUrl) {
    lemonLog("checkout_complete_lost", { quoteId: quote.id });
    const existing = await opts.repo.getCheckoutBinding(quote.id);
    if (existing?.status === "ready" && existing.checkoutUrl) {
      return {
        ok: true,
        url: existing.checkoutUrl,
        quoteId: quote.id,
        finalPriceCents: quote.finalPriceCents,
      };
    }
    await opts.repo.releaseCheckoutClaim(quote.id);
    return { ok: false, error: "checkout_in_progress", status: 409 };
  }

  return {
    ok: true,
    url: finished.checkoutUrl,
    quoteId: quote.id,
    finalPriceCents: quote.finalPriceCents,
  };
}
