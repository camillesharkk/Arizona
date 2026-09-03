import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { refreshUserSession } from "@/lib/devices/http";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = z
    .object({
      name: z.string().max(80).optional(),
      emailDaily: z.boolean().optional(),
      emailWeekly: z.boolean().optional(),
      emailExam: z.boolean().optional(),
      examDate: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null()]).optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const store = await getStore();
  const user = await store.updateUser(session.id, {
    ...(body.data.name !== undefined ? { name: body.data.name } : {}),
    ...(body.data.emailDaily !== undefined ? { emailDaily: body.data.emailDaily } : {}),
    ...(body.data.emailWeekly !== undefined ? { emailWeekly: body.data.emailWeekly } : {}),
    ...(body.data.emailExam !== undefined ? { emailExam: body.data.emailExam } : {}),
    ...(body.data.examDate !== undefined ? { examDate: body.data.examDate ? body.data.examDate : null } : {}),
  });
  await refreshUserSession(
    {
      id: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
      name: user.name,
    },
    session.deviceSessionId
  );
  return NextResponse.json({ ok: true });
}
