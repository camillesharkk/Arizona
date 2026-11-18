import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";

// Existing accounts can open the guide on demand. Keep the cutoff fixed across releases.
const newAccountSince = Date.parse("2026-11-18T17:46:43Z");
// Account-wide receipt in the existing study document store, separate from all state plans.
const guideReceipt = "DAILY_STUDY_GUIDE";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const show = await (await getStore()).accountTransaction(session.id, async (store) => {
    const user = await store.getUserById(session.id);
    if (!user || user.deletedAt || !(Date.parse(user.createdAt) >= newAccountSince)) return false;
    if (await store.getStudyPlan(session.id, guideReceipt)) return false;

    await store.saveStudyPlan({ userId: session.id, state: guideReceipt, document: { shownAt: new Date().toISOString() } });
    return true;
  });
  return NextResponse.json({ show }, { headers: { "Cache-Control": "private, no-store" } });
}
