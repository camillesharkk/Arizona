import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, setSessionCookie } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = z
    .object({
      name: z.string().max(80).optional(),
      emailDaily: z.boolean().optional(),
      emailWeekly: z.boolean().optional(),
      emailExam: z.boolean().optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const store = await getStore();
  const user = await store.updateUser(session.id, body.data);
  await setSessionCookie({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: user.emailVerified,
    name: user.name,
  });
  return NextResponse.json({ ok: true });
}
