import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { createQuote } from "@/lib/commerce/service";
import { publicBreakdown } from "@/lib/commerce/public";
import { isLifetimeProProduct, isPurchasableProProduct } from "@/lib/pro-products";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";

const schema = z.object({
  productCode: z.string().refine(isPurchasableProProduct).optional(),
  applyCredit: z.boolean().optional(),
  policyAccepted: z.boolean(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const lifetime = isLifetimeProProduct(body.data.productCode || "");
  if (lifetime && !await getLifetimeCheckoutAvailability()) {
    return NextResponse.json({ error: "LIFETIME_PRODUCT_UNAVAILABLE" }, { status: 503 });
  }
  const repo = await getCommerceRepo();
  const result = await createQuote(repo, {
    userId: session.id,
    applyCredit: !lifetime && Boolean(body.data.applyCredit),
    policyAccepted: body.data.policyAccepted,
    productCode: body.data.productCode,
  });
  if (!result.ok) {
    const status = result.error === "PRICE_CHANGED" || result.error === "lifetime_already_owned" ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({
    quoteId: result.quote.id,
    expiresAt: result.quote.expiresAt,
    policyVersion: result.quote.policyVersion,
    breakdown: publicBreakdown(result.breakdown),
  });
}
