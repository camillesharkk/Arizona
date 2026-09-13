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
  paddleLog,
  readPaddleCustom,
  type PaddleCheckoutConfig,
  type PaddleListQuery,
  type PaddleTransactionsClient,
  type PaddleTxnSnapshot,
} from "./paddle.ts";

export type ReconcilePaddleCheckoutResult =
  | { ok: true; kind: "ready"; transactionId: string }
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
    return matchPaddleTransactionToQuote(txn, opts.quote, opts.productId).ok;
  });
  return { ok: true, matches };
}

export async function adoptPaddleCreatingBinding(opts: {
  repo: CommerceRepo;
  quoteId: string;
  transactionId: string;
  checkoutUrl?: string | null;
}): Promise<ProviderCheckoutBinding | null> {
  if (!isPaddleTransactionId(opts.transactionId)) return null;
  return opts.repo.adoptCreatingCheckoutBinding({
    quoteId: opts.quoteId,
    provider: PADDLE_PROVIDER,
    providerCheckoutId: opts.transactionId,
    checkoutUrl: opts.checkoutUrl || `paddle-overlay:${opts.transactionId}`,
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
  if (binding.status === "ready" && binding.providerCheckoutId) {
    return { ok: true, kind: "ready", transactionId: binding.providerCheckoutId };
  }
  if (binding.status !== "creating" || binding.providerCheckoutId) {
    return { ok: true, kind: "none" };
  }
  if (bindingAgeMs(binding, now) < PADDLE_CREATING_SAFE_WINDOW_MS) {
    return { ok: true, kind: "in_progress" };
  }

  const createdAtGte = new Date(
    Math.min(new Date(binding.createdAt).getTime(), now.getTime()) - PADDLE_RECONCILE_LOOKBACK_MS
  ).toISOString();
  const listed = await listMatchingPaddleTransactions({
    sdk: opts.sdk ?? createPaddleSdk(opts.config),
    quote: opts.quote,
    productId: opts.config.productId,
    createdAtGte,
    createdAtLte: now.toISOString(),
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
    const adopted = await adoptPaddleCreatingBinding({
      repo: opts.repo,
      quoteId: opts.quote.id,
      transactionId,
      checkoutUrl: txn.checkout?.url,
    });
    const current = adopted ?? (await opts.repo.getCheckoutBinding(opts.quote.id));
    if (current?.status === "ready" && current.providerCheckoutId === transactionId) {
      return { ok: true, kind: "ready", transactionId };
    }
    paddleLog("paddle_transaction_reconciliation_failed", { quoteId: opts.quote.id, orderId: transactionId });
    return { ok: false, error: "paddle_transaction_reconciliation_failed", status: 503 };
  }

  await opts.repo.releaseCheckoutClaim(opts.quote.id);
  const expired =
    opts.quote.status !== "open" || new Date(opts.quote.expiresAt).getTime() <= now.getTime();
  if (expired) {
    await opts.repo.expireQuote(opts.quote.id);
    await opts.repo.releaseCreditsForQuote(opts.quote.id);
    return { ok: true, kind: "cleared", quoteExpired: true };
  }
  return { ok: true, kind: "cleared", quoteExpired: false };
}
