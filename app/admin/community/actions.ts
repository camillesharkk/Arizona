"use server";

import { revalidatePath } from "next/cache";
import { communityAdminInput } from "@/lib/community-admin-input";
import { communityModeration } from "@/lib/community-moderation";
import { operationsAccess } from "@/lib/operations/report-view";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";

type Result = { ok: boolean; message: string };

export async function moderateCommunity(_prior: Result | null, form: FormData): Promise<Result> {
  const session = await getSession();
  if (!session || operationsAccess(session.email, process.env.OPERATIONS_ADMIN_EMAILS) !== "ok") {
    return { ok: false, message: "无权执行社区管理操作。" };
  }
  const input = communityAdminInput.safeParse({
    action: form.get("action"),
    id: form.get("id"),
    reason: form.get("reason"),
    confirm: form.get("confirm"),
  });
  if (!input.success) {
    const confirmation = input.error.issues.find((issue) => issue.message === "请确认恢复公开。");
    return { ok: false, message: confirmation?.message ?? "请选择有效操作并填写 3–400 字的原因。" };
  }
  try {
    if (!await communityModeration().apply(session.id, input.data)) {
      return { ok: false, message: "内容状态已改变或该操作不可用。请刷新后重试。" };
    }
  } catch {
    return { ok: false, message: "本次操作未能保存。请重试。" };
  }
  revalidatePath("/admin/community/");
  revalidatePath(paths.community);
  return { ok: true, message: "操作已保存，并写入处理记录。" };
}
