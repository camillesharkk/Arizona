import { after, NextResponse } from "next/server";
import { applyBillingEvent, parsePaddleLike, verifyMorSignature } from "@/lib/billing";
import { handleLemonWebhook } from "@/lib/billing/lemon-webhook";
import { getLemonConfig, isLemonProvider, verifyLemonWebhookSignature } from "@/lib/billing/lemonsqueezy";
import { PADDLE_PROVIDER, createPaddleSdk, getPaddleWebhookConfig, isPaddleProvider, paddleLog } from "@/lib/billing/paddle";
import { handlePaddleWebhook, paddleWebhookWriteScope, type PaddleWebhookEventLike, type PaddleWebhookResult } from "@/lib/billing/paddle-webhook";
import { reportPaddleFulfillment } from "@/lib/analytics-server";
import { getCommerceRepo } from "@/lib/commerce";
import { grantArizonaPro60d, grantSitePro, refundArizonaOrder } from "@/lib/entitlements";
import { isPurchasableProProduct } from "@/lib/pro-products";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const raw = await req.text();

  if (isLemonProvider()) {
    const cfg = getLemonConfig();
    if (!cfg.ok) {
      return NextResponse.json({ error: cfg.error }, { status: 503 });
    }
    const sig = req.headers.get("x-signature");
    if (!verifyLemonWebhookSignature(raw, sig, cfg.config.webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const repo = await getCommerceRepo();
    const result = await handleLemonWebhook({
      raw,
      headerEventName: req.headers.get("x-event-name"),
      repo,
      config: cfg.config,
      body,
      grantPro: async (opts) => {
        const granted = await grantArizonaPro60d({
          userId: opts.userId,
          provider: opts.provider,
          providerOrderId: opts.providerOrderId,
        });
        return { entitlement: { id: granted.entitlement.id } };
      },
      refundEntitlement: async (opts) => {
        await refundArizonaOrder(opts.userId, opts.provider, opts.providerOrderId);
      },
    });
    return NextResponse.json(result.body, { status: result.status });
  }

  if (isPaddleProvider()) {
    const cfg = getPaddleWebhookConfig();
    if (!cfg.ok) {
      return NextResponse.json({ error: cfg.error }, { status: 503 });
    }
    const signature = req.headers.get("paddle-signature");
    if (!signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    let event: PaddleWebhookEventLike;
    try {
      const paddle = createPaddleSdk(cfg.config);
      event = await paddle.webhooks.unmarshal(raw, cfg.config.webhookSecret, signature) as PaddleWebhookEventLike;
    } catch {
      paddleLog("invalid_signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const run = (repo: Awaited<ReturnType<typeof getCommerceRepo>>, report?: typeof reportPaddleFulfillment) => handlePaddleWebhook({
      repo, report,
      config: cfg.config,
      event,
      grantPro: async (opts) => {
        if (!isPurchasableProProduct(opts.productCode)) throw new Error("product_mismatch");
        const granted = await grantSitePro(opts);
        return { entitlement: { id: granted.entitlement.id } };
      },
      refundEntitlement: async (opts) => {
        await refundArizonaOrder(opts.userId, opts.provider, opts.providerOrderId);
      },
    });
    const reports: Parameters<typeof reportPaddleFulfillment>[0][] = [];
    const collect: typeof reportPaddleFulfillment = async (report) => { reports.push(report); };
    const reportAfterCommit = (committed: boolean) => after(async () => {
      await Promise.allSettled(reports.filter(report => committed || !report.orderConfirmed).map(async report => {
        if (!report.duplicate && report.orderConfirmed && report.transactionId) {
          const row = await (await getStore()).getEntitlementByProviderOrder(PADDLE_PROVIDER, report.transactionId).catch(() => null);
          if (!row || row.id !== report.entitlementId || row.userId !== report.userId || row.status !== "active") {
            paddleLog("entitlement_readback_missing", { orderId: report.transactionId });
            report.entitlementId = null;
          } else {
            paddleLog("entitlement_readback_confirmed", { orderId: report.transactionId });
          }
        }
        await reportPaddleFulfillment(report);
      }));
    });
    const scope = paddleWebhookWriteScope(event, cfg.config);
    let result: PaddleWebhookResult;
    if (scope && /^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) {
      const { getPgSql, withPaddlePaymentTransaction } = await import("@/lib/store/pg-store");
      const { createPgCommerceRepo } = await import("@/lib/commerce/pg-repo");
      let rejected: PaddleWebhookResult | undefined;
      try {
        result = await withPaddlePaymentTransaction(scope.transactionId, scope.userId, async () => {
          const outcome = await run(createPgCommerceRepo(getPgSql()), collect);
          if (outcome.status >= 400) {
            rejected = outcome;
            throw new Error("paddle_write_rejected");
          }
          return outcome;
        });
      } catch {
        reportAfterCommit(false);
        if (rejected) return NextResponse.json(rejected.body, { status: rejected.status });
        paddleLog("paddle_write_failed", { event: event.eventType, orderId: scope.transactionId });
        return NextResponse.json({ error: "Payment update unavailable" }, { status: 503 });
      }
    } else {
      result = await run(await getCommerceRepo(), collect);
    }
    reportAfterCommit(result.status === 200);
    if (result.status === 200 && result.recordNotificationId) {
      try {
        const store = await getStore();
        await store.seenWebhook(result.recordNotificationId, PADDLE_PROVIDER);
      } catch {
        paddleLog("webhook_seen_failed", { event: String(event.eventType || ""), orderId: String(event.data?.id || "") });
      }
    }
    return NextResponse.json(result.body, { status: result.status });
  }

  const sig = req.headers.get("x-mor-signature") || req.headers.get("paddle-signature") || req.headers.get("x-signature");
  if (!verifyMorSignature(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const event = parsePaddleLike(body);
  if (!event) return NextResponse.json({ ok: true, ignored: true });
  const result = await applyBillingEvent(event);
  return NextResponse.json(result);
}
