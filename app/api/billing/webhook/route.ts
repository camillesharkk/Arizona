import { NextResponse } from "next/server";
import { applyBillingEvent, parsePaddleLike, verifyMorSignature } from "@/lib/billing";
import { handleLemonWebhook } from "@/lib/billing/lemon-webhook";
import { getLemonConfig, isLemonProvider, verifyLemonWebhookSignature } from "@/lib/billing/lemonsqueezy";
import { PADDLE_PROVIDER, createPaddleSdk, getPaddleWebhookConfig, isPaddleProvider, paddleLog } from "@/lib/billing/paddle";
import { handlePaddleWebhook } from "@/lib/billing/paddle-webhook";
import { getCommerceRepo } from "@/lib/commerce";
import { grantArizonaPro60d, refundArizonaOrder } from "@/lib/entitlements";
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
    let event: { eventType?: string; notificationId?: string | null; data?: { id?: string } };
    try {
      const paddle = createPaddleSdk(cfg.config);
      event = await paddle.webhooks.unmarshal(raw, cfg.config.webhookSecret, signature);
    } catch {
      paddleLog("invalid_signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const repo = await getCommerceRepo();
    const result = await handlePaddleWebhook({
      repo,
      config: cfg.config,
      event,
      grantPro: async (opts) => {
        const granted = await grantArizonaPro60d({
          userId: opts.userId,
          provider: opts.provider,
          providerOrderId: opts.providerOrderId,
        });
        return { entitlement: { id: granted.entitlement.id } };
      },
    });
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
