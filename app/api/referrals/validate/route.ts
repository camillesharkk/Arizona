import { NextResponse } from "next/server";
import { getCommerceRepo } from "@/lib/commerce";
import { validateReferralCode } from "@/lib/commerce/service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const repo = await getCommerceRepo();
  const result = await validateReferralCode(repo, code);
  if (!result.valid) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, code: result.code });
}
