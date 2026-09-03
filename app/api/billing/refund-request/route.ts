import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { requestEligibleRefund } from "@/lib/commerce/service";

const schema = z.object({ orderId: z.string().uuid() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const repo = await getCommerceRepo();
  const result = await requestEligibleRefund(repo, { userId: session.id, orderId: body.data.orderId });
  if (!result.ok) {
    return NextResponse.json({ error: result.error, eligibility: { eligible: false, reason: result.error } }, { status: 409 });
  }
  return NextResponse.json({
    ok: true,
    status: "pending_manual",
    message: "Refund request recorded. Payment-provider refund is not completed automatically yet.",
  });
}
