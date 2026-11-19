import { z } from "zod";

export const communityAdminInput = z.object({
  action: z.enum(["hide", "restore", "approve", "reject", "warn", "ban", "unban", "resolve-report"]),
  id: z.string().uuid().toLowerCase(),
  reason: z.string().trim().min(3).max(400).refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value.replace(/[\n\r\t]/g, ""))),
  confirm: z.literal("yes").nullable(),
}).refine(({ action, confirm }) => action !== "restore" || confirm === "yes", { message: "请确认恢复公开。" });

export type CommunityAdminInput = z.infer<typeof communityAdminInput>;
