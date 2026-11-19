"use server";

import { revalidatePath } from "next/cache";
import { manualProInput } from "@/lib/manual-pro-input";
import { grantManualPro, ManualProGrantError } from "@/lib/manual-pro";
import { operationsAccess } from "@/lib/operations/report-view";
import { getSession } from "@/lib/session";

export type GrantResult = { ok: boolean; message: string; expiresAt?: string; duplicate?: boolean };

export async function submitProGrant(_previous: GrantResult | null, form: FormData): Promise<GrantResult> {
  const session = await getSession();
  if (!session || operationsAccess(session.email, process.env.OPERATIONS_ADMIN_EMAILS) !== "ok") {
    return { ok: false, message: "无权授予或延长 Pro。" };
  }
  if (form.get("confirm") !== "yes") {
    return { ok: false, message: "请核对账号、产品和天数，再确认授权。" };
  }

  const rawDays = form.get("days");
  const input = manualProInput.safeParse({
    requestId: form.get("requestId"),
    email: form.get("email"),
    productCode: form.get("productCode"),
    days: typeof rawDays === "string" && /^\d+$/.test(rawDays) ? Number(rawDays) : NaN,
    reason: form.get("reason"),
  });
  if (!input.success) {
    return { ok: false, message: "请填写有效的账号邮箱、限时 Pro 产品、授权天数和原因。" };
  }

  let result: Awaited<ReturnType<typeof grantManualPro>>;
  try {
    result = await grantManualPro(input.data, { kind: "administrator", id: session.id });
  } catch (error) {
    if (error instanceof ManualProGrantError) {
      const message = {
        lifetime: "该账号已有 Lifetime Pro，限时授权无需追加。",
        product: "所选产品不适用于此账号。请核对历史产品或选择全站限期 Pro。",
        account: "未找到唯一可授权的账号，请核对邮箱。",
        request: "此请求编号已用于另一笔操作。请重新加载后新建授权。",
        unavailable: "授权服务暂时不可用，请用当前表单重试。",
      }[error.code];
      return { ok: false, message };
    }
    return { ok: false, message: "授权未完成。请用当前表单重试。" };
  }
  revalidatePath("/admin/pro-grants/");
  return {
    ok: true,
    message: result.duplicate ? "此请求已处理，未重复增加天数。" : "Pro 授权已保存。",
    expiresAt: result.receipt.expiresAt,
    duplicate: result.duplicate,
  };
}
