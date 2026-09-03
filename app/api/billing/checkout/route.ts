import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, setSessionCookie } from "@/lib/session";
import { getStore } from "@/lib/store";
import { checkoutUrl } from "@/lib/billing";
import { grantArizonaPro60d, hasArizonaPro } from "@/lib/entitlements";
import { getCommerceRepo } from "@/lib/commerce";
import { assertQuoteStillValid, abandonQuote, confirmPaidOrder } from "@/lib/commerce/service";

const postSchema = z.object({
  quoteId: z.string().uuid(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = postSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "quote_required" }, { status: 400 });
  const repo = await getCommerceRepo();
  const quote = await repo.getQuote(body.data.quoteId);
  if (!quote || quote.userId !== session.id) return NextResponse.json({ error: "quote_not_found" }, { status: 404 });
  const valid = await assertQuoteStillValid(repo, quote);
  if (!valid.ok) {
    await abandonQuote(repo, quote.id);
    return NextResponse.json({ error: valid.error }, { status: valid.error === "PRICE_CHANGED" ? 409 : 400 });
  }
  const checkout = checkoutUrl(session);
  if (checkout.includes("checkout=mock")) {
    return NextResponse.json({
      url: `/api/billing/checkout/?mock=success&quoteId=${encodeURIComponent(quote.id)}`,
      quoteId: quote.id,
      finalPriceCents: quote.finalPriceCents,
    });
  }
  return NextResponse.json({ url: checkout, quoteId: quote.id, finalPriceCents: quote.finalPriceCents });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("mock") !== "success") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const quoteId = url.searchParams.get("quoteId") || "";
  if (!quoteId) return NextResponse.json({ error: "quote_required" }, { status: 400 });
  const repo = await getCommerceRepo();
  const result = await confirmPaidOrder(repo, {
    userId: session.id,
    quoteId,
    provider: "mock",
    providerOrderId: `mock-${quoteId}`,
    grantPro: async (opts) => grantArizonaPro60d(opts),
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  const store = await getStore();
  const user = await store.getUserById(session.id);
  if (user) {
    await setSessionCookie({
      id: user.id,
      email: user.email,
      plan: (await hasArizonaPro(user.id)) ? "pro" : "free",
      planStatus: "active",
      emailVerified: user.emailVerified,
      name: user.name,
      deviceSessionId: session.deviceSessionId,
    });
  }
  return NextResponse.redirect(new URL("/dashboard/?upgraded=1", req.url));
}
