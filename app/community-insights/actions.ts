"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { communityInsights } from "@/data/community-insights";
import { communityDiscussionPath } from "@/lib/community-links";
import { communityLimits, communityReportReasons, nicknameValue, unreadableCommunityText } from "@/lib/community-policy";
import { communityStore } from "@/lib/community-store";
import { paths } from "@/lib/paths";
import { rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

const uuid = z.string().uuid();
const postInput = z.object({
  id: uuid,
  insightId: z.string().max(90).nullable(),
  parentId: uuid.nullable(),
  title: z.string().trim().min(3).max(communityLimits.postTitleMax).nullable(),
  body: z.string().trim().min(3).max(communityLimits.postBodyMax),
});

export type PublishDiscussionResult = { message: string; status?: "published" | "pending"; href?: string; retryAfterSeconds?: number };
export type CommunityReportResult = { message: string; ok?: boolean };

export async function publishDiscussion(_prior: PublishDiscussionResult, form: FormData): Promise<PublishDiscussionResult> {
  const session = await getSession();
  if (!session) return { message: "Sign in again to post." };
  if (!process.env.DATABASE_URL) return { message: "Discussions are temporarily unavailable." };
  const parsed = postInput.safeParse({
    id: form.get("id"),
    insightId: form.get("insightId"),
    parentId: form.get("parentId"),
    title: form.get("title"),
    body: form.get("body"),
  });
  if (!parsed.success) return { message: "Use 3–100 characters for a title and 3–1,600 for the message." };
  const { insightId, parentId, title, body, id } = parsed.data;
  if (insightId !== null && !communityInsights.some((item) => item.id === insightId)) return { message: "This study insight is unavailable." };
  if (Boolean(title) !== (parentId === null && insightId === null)) return { message: "Check the discussion title and try again." };
  if (unreadableCommunityText.test(body) || (title && unreadableCommunityText.test(title))) {
    return { message: "Remove unreadable characters and try again." };
  }

  let result: Awaited<ReturnType<ReturnType<typeof communityStore>["publish"]>>;
  try {
    result = await communityStore().publish({ id, insightId, parentId, title, body, userId: session.id });
  } catch {
    return { message: "We could not save your message. Please try again." };
  }
  if (!result.ok) {
    if (result.code === "rate") {
      const seconds = result.retryAfterSeconds;
      return { message: `Posting limit reached. Try again in ${seconds} ${seconds === 1 ? "second" : "seconds"}.`, retryAfterSeconds: seconds };
    }
    return { message: {
      missing: "This discussion is no longer available.",
      depth: "Reply to an earlier message in this thread.",
      full: "This thread has reached its reply limit.",
      banned: "Your community access is restricted.",
      nickname: "Set a community nickname before posting.",
      duplicate: "This message was already submitted. Check the discussion before retrying.",
      link: "Remove the link with an unsafe protocol or embedded credentials and try again.",
    }[result.code] };
  }

  revalidatePath(paths.community);
  return result.status === "pending"
    ? { status: "pending", message: "This message is awaiting moderator review. You can see it under Awaiting review." }
    : { status: "published", message: "Message posted.", href: communityDiscussionPath(insightId, result.threadId) };
}

export async function saveCommunityNickname(_prior: string, form: FormData): Promise<string> {
  const session = await getSession();
  if (!session) return "Sign in again to save a nickname.";
  if (!process.env.DATABASE_URL) return "Community settings are temporarily unavailable.";
  const raw = form.get("nickname");
  const nickname = typeof raw === "string" && raw.length <= 128 ? nicknameValue(raw) : null;
  if (!nickname) return "Choose a 2–32 character nickname using letters, numbers, spaces, dots, underscores or hyphens. Avoid staff names.";
  try {
    await communityStore().setNickname(session.id, nickname);
  } catch {
    return "We could not save your nickname. Try again.";
  }
  revalidatePath(paths.community);
  return "";
}

const reportInput = z.object({
  id: uuid,
  reason: z.enum(communityReportReasons),
  note: z.string().trim().max(communityLimits.reportNoteMax),
});

export async function reportDiscussion(_prior: CommunityReportResult, form: FormData): Promise<CommunityReportResult> {
  const session = await getSession();
  if (!session) return { message: "Sign in again to report a message." };
  if (!process.env.DATABASE_URL) return { message: "Reporting is temporarily unavailable." };
  const parsed = reportInput.safeParse({ id: form.get("id"), reason: form.get("reason"), note: form.get("note") ?? "" });
  if (!parsed.success || unreadableCommunityText.test(parsed.data.note)) {
    return { message: "Choose a reason and use up to 300 readable characters for your note." };
  }
  try {
    const { id, reason, note } = parsed.data;
    const outcome = await communityStore().report(id, session.id, reason, note);
    if (outcome === "reported") return { ok: true, message: "Report received. Thank you." };
    if (outcome === "duplicate") return { ok: true, message: "You already reported this message." };
    if (outcome === "banned") return { message: "Your community access is restricted." };
    return { message: "This message is no longer available." };
  } catch {
    return { message: "We could not send the report. Please try again." };
  }
}

const postAction = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("like"), id: uuid, value: z.enum(["on", "off"]) }),
  z.object({ kind: z.literal("insight-like"), id: z.string().max(90), value: z.enum(["on", "off"]) }),
  z.object({ kind: z.literal("remove"), id: uuid }),
]);

export async function changeDiscussion(_prior: string, form: FormData): Promise<string> {
  const session = await getSession();
  if (!session) return "Sign in again to continue.";
  if (!process.env.DATABASE_URL) return "Discussions are temporarily unavailable.";
  const parsed = postAction.safeParse({ kind: form.get("kind"), id: form.get("id"), value: form.get("value") });
  if (!parsed.success) return "This discussion action is invalid.";
  if (!rateLimit(`community-action:${session.id}`, 60, 60_000).ok) return "Please wait before trying again.";
  const action = parsed.data;
  try {
    const store = communityStore();
    if (action.kind === "like") {
      await store.setLike(action.id, session.id, action.value === "on");
    } else if (action.kind === "insight-like") {
      if (!communityInsights.some((item) => item.id === action.id)) return "This study insight is unavailable.";
      await store.setInsightLike(action.id, session.id, action.value === "on");
    } else if (!await store.remove(action.id, session.id)) {
      return "This message is unavailable or does not belong to you.";
    }
  } catch {
    return "We could not save this change. Try again.";
  }
  revalidatePath(paths.community);
  return "";
}
