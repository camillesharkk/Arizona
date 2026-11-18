import { paths } from "@/lib/paths";

export function communityDiscussionPath(insightId?: string | null, threadId?: string | null, page = 0, replyTo?: string) {
  const query = new URLSearchParams();
  if (insightId) query.set("insight", insightId);
  if (threadId) query.set("discussion", threadId);
  if (replyTo) query.set("reply", replyTo);
  if (page > 0) query.set("page", String(page + 1));
  const suffix = query.toString();
  return `${paths.community}${suffix ? `?${suffix}` : ""}#${replyTo ? "reply-composer" : "community-discussions"}`;
}
