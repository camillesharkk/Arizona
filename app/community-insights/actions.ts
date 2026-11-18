"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { communityInsights } from "@/data/community-insights";
import { communityDiscussionPath } from "@/lib/community-links";
import { communityStore } from "@/lib/community-store";
import { paths } from "@/lib/paths";
import { rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

const uuid = z.string().uuid();
const postInput = z.object({
  id: uuid,
  insightId: z.string().max(90).nullable(),
  parentId: uuid.nullable(),
  title: z.string().trim().min(3).max(100).nullable(),
  body: z.string().trim().min(3).max(1600),
});

export async function publishDiscussion(_prior: string, form: FormData): Promise<string> {
  const session = await getSession();
  if (!session) return "Sign in again to post.";
  if (!process.env.DATABASE_URL) return "Discussions are temporarily unavailable.";
  const parsed = postInput.safeParse({
    id: form.get("id"),
    insightId: form.get("insightId"),
    parentId: form.get("parentId"),
    title: form.get("title"),
    body: form.get("body"),
  });
  if (!parsed.success) return "Use 3–100 characters for a title and 3–1,600 for the message.";
  const { insightId, parentId, title, body, id } = parsed.data;
  if (insightId !== null && !communityInsights.some((item) => item.id === insightId)) return "This study insight is unavailable.";
  if (Boolean(title) !== (parentId === null && insightId === null)) return "Check the discussion title and try again.";
  const forbidden = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/;
  if (forbidden.test(body) || (title && forbidden.test(title))) return "Remove unreadable characters and try again.";
  let threadId: string;
  try {
    const result = await communityStore().publish({
      id, insightId, parentId, title, body, userId: session.id,
    });
    if (!result.ok) {
      return {
        rate: "You’ve posted several messages recently. Please try again later.",
        missing: "This discussion is no longer available.",
        depth: "Reply to an earlier message in this thread.",
        full: "This thread has reached its reply limit.",
      }[result.code];
    }
    threadId = result.threadId;
  } catch {
    return "We could not save your message. Please try again.";
  }
  revalidatePath(paths.community);
  redirect(communityDiscussionPath(insightId, threadId));
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
