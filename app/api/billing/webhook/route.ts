import { NextResponse } from "next/server";
import { applyBillingEvent, parsePaddleLike, verifyMorSignature } from "@/lib/billing";
import { handleLemonWebhook } from "@/lib/billing/lemon-webhook";
import { getLemonConfig, isLemonProvider, verifyLemonWebhookSignature } from "@/lib/billing/lemonsqueezy";
import { getCommerceRepo } from "@/lib/commerce";
import { grantArizonaPro60d, refundArizonaOrder } from "@/lib/entitlements";

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
