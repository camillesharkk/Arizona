import type { CommerceRepo } from "../commerce/repo.ts";
import type { PricingQuoteRow, ProviderCheckoutBinding } from "../commerce/types.ts";
import {
  PADDLE_CREATING_SAFE_WINDOW_MS,
  PADDLE_PROVIDER,
  PADDLE_RECONCILE_LOOKBACK_MS,
  PADDLE_RECONCILE_MAX_RESULTS,
  PADDLE_RECONCILE_PER_PAGE,
  createPaddleSdk,
  isPaddleTransactionId,
  matchPaddleTransactionToQuote,
  paddleCatalogForProduct,
  paddleLog,
  readPaddleCustom,
  type PaddleCheckoutConfig,
  type PaddleListQuery,
  type PaddleTransactionsClient,
  type PaddleTxnSnapshot,
} from "./paddle.ts";

export type ReconcilePaddleCheckoutResult =
  | { ok: true; kind: "ready"; transactionId: string; paymentPending?: boolean }
  | { ok: true; kind: "in_progress" }
  | { ok: true; kind: "cleared"; quoteExpired: boolean }
  | { ok: true; kind: "none" }
  | {
      ok: false;
      error: "paddle_transaction_reconciliation_conflict" | "paddle_transaction_reconciliation_failed";
      status: number;
      transactionIds?: string[];
    };

function bindingAgeMs(binding: ProviderCheckoutBinding, now: Date) {
  return now.getTime() - new Date(binding.createdAt).getTime();
}

export function isPaddleStaleCreating(binding: ProviderCheckoutBinding | null, now: Date) {
  if (!binding) return false;
  if (binding.provider !== PADDLE_PROVIDER) return false;
  if (binding.status !== "creating") return false;
  if (binding.providerCheckoutId) return false;
  return bindingAgeMs(binding, now) >= PADDLE_CREATING_SAFE_WINDOW_MS;
}

function toSnapshot(row: PaddleTxnSnapshot): PaddleTxnSnapshot {
  const custom =
    row.customData && typeof row.customData === "object" ? (row.customData as Record<string, unknown>) : null;
  return {
    id: row.id,
    status: row.status,
    currencyCode: row.currencyCode,
    discountId: row.discountId ?? null,
    customData: custom,
    items: row.items ?? null,
    details: row.details ?? null,
    checkout: row.checkout ?? null,
    createdAt: row.createdAt,
  };
}

async function collectListedTransactions(
  sdk: PaddleTransactionsClient,
  query: PaddleListQuery
): Promise<{ ok: true; items: PaddleTxnSnapshot[] } | { ok: false; error: string }> {
  if (!sdk.transactions.list) {
    return { ok: false, error: "paddle_transaction_reconciliation_failed" };
  }
  try {
    const listed = sdk.transactions.list(query);
    const items: PaddleTxnSnapshot[] = [];
    const push = (row: PaddleTxnSnapshot) => {
      items.push(toSnapshot(row));
    };
    if (listed && typeof (listed as Promise<PaddleTxnSnapshot[]>).then === "function") {
      const rows = await (listed as Promise<PaddleTxnSnapshot[]>);
      for (const row of rows) push(row);
    } else if (listed && typeof (listed as AsyncIterable<PaddleTxnSnapshot>)[Symbol.asyncIterator] === "function") {
      for await (const row of listed as AsyncIterable<PaddleTxnSnapshot>) {
        push(row);
        if (items.length > PADDLE_RECONCILE_MAX_RESULTS) break;
      }
    } else if (listed && typeof (listed as Iterable<PaddleTxnSnapshot>)[Symbol.iterator] === "function") {
      for (const row of listed as Iterable<PaddleTxnSnapshot>) {
        push(row);
        if (items.length > PADDLE_RECONCILE_MAX_RESULTS) break;
      }
    }
    if (items.length > PADDLE_RECONCILE_MAX_RESULTS) {
      return { ok: false, error: "paddle_transaction_reconciliation_failed" };
    }
    return { ok: true, items };
  } catch {
    return { ok: false, error: "paddle_transaction_reconciliation_failed" };
  }
}

export async function listMatchingPaddleTransactions(opts: {
  sdk: PaddleTransactionsClient;
  quote: PricingQuoteRow;
  productId: string;
  priceId?: string;
  createdAtGte: string;
  createdAtLte: string;
}): Promise<{ ok: true; matches: PaddleTxnSnapshot[] } | { ok: false; error: string }> {
  const listed = await collectListedTransactions(opts.sdk, {
    "createdAt[GTE]": opts.createdAtGte,
    "createdAt[LTE]": opts.createdAtLte,
    perPage: PADDLE_RECONCILE_PER_PAGE,
  });
  if (!listed.ok) return listed;
  const matches = listed.items.filter((txn) => {
    if (readPaddleCustom(txn).quote_id !== opts.quote.id) return false;
    // A mismatched Lifetime transaction can still be payable and must fence its replacement.
    return Boolean(opts.priceId) || matchPaddleTransactionToQuote(txn, opts.quote, opts.productId).ok;
  });
  return { ok: true, matches };
}

export async function adoptPaddleCreatingBinding(opts: {
  repo: CommerceRepo;
  quoteId: string;
  transactionId: string;
  checkoutUrl?: string | null;
  expectedCreatedAt?: string;
}): Promise<ProviderCheckoutBinding | null> {
  if (!isPaddleTransactionId(opts.transactionId)) return null;
  return opts.repo.adoptCreatingCheckoutBinding({
    quoteId: opts.quoteId,
    provider: PADDLE_PROVIDER,
    providerCheckoutId: opts.transactionId,
    checkoutUrl: opts.checkoutUrl || `paddle-overlay:${opts.transactionId}`,
    expectedCreatedAt: opts.expectedCreatedAt,
  });
}

export async function reconcilePaddleCheckoutBinding(opts: {
  repo: CommerceRepo;
  quote: PricingQuoteRow;
  config: PaddleCheckoutConfig;
  now?: Date;
  sdk?: PaddleTransactionsClient;
}): Promise<ReconcilePaddleCheckoutResult> {
  const now = opts.now ?? new Date();
  const binding = await opts.repo.getCheckoutBinding(opts.quote.id);
  if (!binding) return { ok: true, kind: "none" };
  if (binding.provider !== PADDLE_PROVIDER) return { ok: true, kind: "none" };
  const catalog = paddleCatalogForProduct(opts.config, opts.quote.productCode);
  if (!catalog) return { ok: false, error: "paddle_transaction_reconciliation_failed", status: 503 };
  const expectedCreatedAt = binding.createdAt;
  if (binding.providerCheckoutId && (binding.status === "ready" || (catalog.priceId && binding.status === "creating"))) {
    const sdk = opts.sdk ?? createPaddleSdk(opts.config);
    if (sdk.transactions.get) {
      try {
        const transaction = await sdk.transactions.get(binding.providerCheckoutId);
        if (transaction.id !== binding.providerCheckoutId) throw new Error("transaction_mismatch");
        if (transaction.status === "canceled") {
          const cleared = await opts.repo.clearCanceledCheckout(opts.quote.id, binding.providerCheckoutId);
          if (!cleared) throw new Error("binding_changed");
          await opts.repo.expireQuote(opts.quote.id);
          await opts.repo.releaseCreditsForQuote(opts.quote.id);
          return { ok: true, kind: "cleared", quoteExpired: true };
        }
        if (catalog.priceId) {
          const match = matchPaddleTransactionToQuote(transaction, opts.quote, catalog.productId, catalog.priceId);
          if (!match.ok) throw new Error("transaction_mismatch");
          if (binding.status === "creating") {
            const resolved = await opts.repo.completeCheckoutBinding({
              quoteId: opts.quote.id,
              providerCheckoutId: binding.providerCheckoutId,
              checkoutUrl: transaction.checkout?.url || `paddle-overlay:${binding.providerCheckoutId}`,
              expectedCreatedAt,
            });
            if (!resolved) return { ok: true, kind: "in_progress" };
          }
          return {
            ok: true, kind: "ready", transactionId: binding.providerCheckoutId,
            paymentPending: transaction.status === "paid" || transaction.status === "completed",
          };
        }
      } catch {
        return { ok: false, error: "paddle_transaction_reconciliation_failed", status: 503 };
      }
    }
    if (catalog.priceId) return { ok: false, error: "paddle_transaction_reconciliation_failed", status: 503 };
    return { ok: true, kind: "ready", transactionId: binding.providerCheckoutId };
  }
  if (binding.status !== "creating" || binding.providerCheckoutId) {
    return { ok: true, kind: "none" };
  }
  if (bindingAgeMs(binding, now) < PADDLE_CREATING_SAFE_WINDOW_MS) {
    return { ok: true, kind: "in_progress" };
  }

  const claimedAt = Date.parse(expectedCreatedAt);
  const createdAtGte = new Date(claimedAt - PADDLE_RECONCILE_LOOKBACK_MS).toISOString();
  const createdAtLte = catalog.priceId
    ? new Date(claimedAt + PADDLE_CREATING_SAFE_WINDOW_MS + PADDLE_RECONCILE_LOOKBACK_MS)
    : now;
  const listed = await listMatchingPaddleTransactions({
    sdk: opts.sdk ?? createPaddleSdk(opts.config),
    quote: opts.quote,
    ...catalog,
    createdAtGte,
    createdAtLte: createdAtLte.toISOString(),
  });
  if (!listed.ok) {
    paddleLog("paddle_transaction_reconciliation_failed", { quoteId: opts.quote.id });
    return { ok: false, error: "paddle_transaction_reconciliation_failed", status: 503 };
  }

  if (listed.matches.length > 1) {
    const transactionIds = listed.matches.map((t) => String(t.id || "")).filter(Boolean);
    paddleLog("paddle_transaction_reconciliation_conflict", {
      quoteId: opts.quote.id,
      event: transactionIds.join(","),
    });
    return {
      ok: false,
      error: "paddle_transaction_reconciliation_conflict",
      status: 409,
      transactionIds,
    };
  }

  if (listed.matches.length === 1) {
    const txn = listed.matches[0];
    const transactionId = String(txn.id || "");
    if (isPaddleTransactionId(transactionId) && txn.status === "canceled") {
      if (!await opts.repo.releaseCheckoutClaim(opts.quote.id, expectedCreatedAt)) return { ok: true, kind: "in_progress" };
      await opts.repo.expireQuote(opts.quote.id);
      await opts.repo.releaseCreditsForQuote(opts.quote.id);
      return { ok: true, kind: "cleared", quoteExpired: true };
    }
    if (catalog.priceId && !matchPaddleTransactionToQuote(txn, opts.quote, catalog.productId, catalog.priceId).ok) {
      if (isPaddleTransactionId(transactionId)) {
        await opts.repo.completeCheckoutBinding({
          quoteId: opts.quote.id, providerCheckoutId: transactionId, checkoutUrl: null, expectedCreatedAt,
        });
      }
      return { ok: false, error: "paddle_transaction_reconciliation_conflict", status: 409, transactionIds: [transactionId] };
    }
    const adopted = await adoptPaddleCreatingBinding({
      repo: opts.repo,
      quoteId: opts.quote.id,
      transactionId,
      checkoutUrl: txn.checkout?.url,
      expectedCreatedAt,
    });
    const current = adopted ?? (await opts.repo.getCheckoutBinding(opts.quote.id));
    if (current?.status === "ready" && current.providerCheckoutId === transactionId) {
      return { ok: true, kind: "ready", transactionId, paymentPending: catalog.priceId
        ? txn.status === "paid" || txn.status === "completed" : undefined };
    }
    paddleLog("paddle_transaction_reconciliation_failed", { quoteId: opts.quote.id, orderId: transactionId });
    return { ok: false, error: "paddle_transaction_reconciliation_failed", status: 503 };
  }

  if (!await opts.repo.releaseCheckoutClaim(opts.quote.id, expectedCreatedAt)) return { ok: true, kind: "in_progress" };
  const expired =
    opts.quote.status !== "open" || new Date(opts.quote.expiresAt).getTime() <= now.getTime();
  if (expired) {
    await opts.repo.expireQuote(opts.quote.id);
    await opts.repo.releaseCreditsForQuote(opts.quote.id);
    return { ok: true, kind: "cleared", quoteExpired: true };
  }
  return { ok: true, kind: "cleared", quoteExpired: false };
}
