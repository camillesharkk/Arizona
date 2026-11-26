import { z } from "zod";

export const sourcePlatforms = ["Reddit", "YouTube", "Facebook", "LinkedIn"] as const;
export type SourcePlatform = typeof sourcePlatforms[number];

const hosts: Record<SourcePlatform, readonly string[]> = {
  Reddit: ["reddit.com", "www.reddit.com", "old.reddit.com"],
  YouTube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  Facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
  LinkedIn: ["linkedin.com", "www.linkedin.com"],
};

export function publicSourceUrl(platform: SourcePlatform, input: string) {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
      !hosts[platform].includes(url.hostname)) return null;
    const path = url.pathname;
    const validPath = {
      Reddit: /^\/r\/[\w]+\/comments\/[\w]+(?:\/|$)/.test(path),
      YouTube: url.hostname === "youtu.be" ? /^\/[\w-]+\/?$/.test(path) :
        (path === "/watch" && /^[\w-]+$/.test(url.searchParams.get("v") ?? "")) ||
        /^\/(shorts|live)\/[\w-]+\/?$/.test(path),
      Facebook: /^\/(?:permalink|story)\.php$/.test(path) && url.searchParams.has("story_fbid") ||
        /^\/(?:[\w.]+\/posts|groups\/[\w.]+\/(?:posts|permalink))\/[\w]+\/?$/.test(path),
      LinkedIn: /^\/posts\//.test(path) || /^\/feed\/update\//.test(path),
    }[platform];
    return validPath ? url : null;
  } catch {
    return null;
  }
}

function redditIds(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const marker = parts.indexOf("comments");
  const post = marker < 0 ? undefined : parts[marker + 1];
  const comment = marker < 0 ? undefined : parts[marker + 3];
  return { post, comment };
}

export function sourceKey(platform: SourcePlatform, input: string) {
  const url = publicSourceUrl(platform, input);
  if (!url) return null;
  if (platform === "Reddit") {
    const { post, comment } = redditIds(url);
    return post ? "reddit:" + post.toLowerCase() + (comment ? ":" + comment.toLowerCase() : "") : null;
  }
  if (platform === "YouTube") {
    const video = url.hostname === "youtu.be" ? url.pathname.slice(1) :
      url.searchParams.get("v") || /^\/(?:shorts|live)\/([^/]+)\/?$/.exec(url.pathname)?.[1];
    const comment = url.searchParams.get("lc");
    return video ? "youtube:" + video + (comment ? ":" + comment : "") : null;
  }
  if (platform === "Facebook") {
    const post = url.searchParams.get("story_fbid") || url.pathname.replace(/\/$/, "");
    const comment = url.searchParams.get("reply_comment_id") || url.searchParams.get("comment_id");
    return "facebook:" + post + (comment ? ":" + comment : "");
  }
  return platform.toLowerCase() + ":" + url.pathname.replace(/\/$/, "");
}

const isoDate = z.string().date();
const sourceSchema = z.object({
  type: z.enum(["comment", "post"]),
  locator: z.enum(["comment_direct", "parent_only"]),
  title: z.string().min(1).max(300),
  parentUrl: z.string().url(),
  commentId: z.string().min(1).max(200).nullable(),
  publishedAt: isoDate.nullable(),
  commentPublishedAt: isoDate.nullable(),
  collectedAt: isoDate,
  verification: z.literal("original-public-page"),
  verificationNote: z.string().min(10).max(220),
  factCheck: z.enum(["personal-experience-only", "official-reference-checked"]),
});
const externalSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)+$/).max(90),
  state: z.string().regex(/^(?:[A-Z]{2}|General)$/),
  topic: z.string().min(1).max(48),
  title: z.string().min(1).max(120),
  summary: z.string().min(30).max(500),
  platform: z.enum(["Reddit", "YouTube", "Facebook"]),
  postUrl: z.string().url(),
  checkedAt: isoDate,
  updatedAt: isoDate,
  studyHref: z.string().regex(/^\/(?![\/\\])[^\\]*$/),
  studyLabel: z.string().min(1).max(75),
  officialUrl: z.string().url().refine(url => url.startsWith("https://")).nullable(),
  keywords: z.array(z.string().min(1).max(45)).min(1).max(6),
  status: z.enum(["published", "hidden"]),
  source: sourceSchema,
}).strict();

export type ExternalInsight = z.infer<typeof externalSchema>;
export type ExternalSource = ExternalInsight["source"];

export function parseExternalSources(input: unknown): ExternalInsight[] {
  const rows = z.array(externalSchema).parse(input);
  const ids = new Set<string>();
  const links = new Set<string>();
  for (const row of rows) {
    const { source, platform } = row;
    const link = publicSourceUrl(platform, row.postUrl);
    const sourceId = sourceKey(platform, row.postUrl);
    const parentId = sourceKey(platform, source.parentUrl);
    const commentId = link && (platform === "Reddit" ? redditIds(link).comment :
      platform === "YouTube" ? link.searchParams.get("lc") :
      link.searchParams.get("reply_comment_id") || link.searchParams.get("comment_id"));
    if (!sourceId || !parentId || ids.has(row.id) || links.has(sourceId) ||
      (source.locator === "comment_direct" && (source.type !== "comment" || !commentId || source.commentId !== commentId || sourceId !== parentId + ":" + commentId)) ||
      (source.locator === "parent_only" && (sourceId !== parentId || commentId)) ||
      (source.type === "post" && (source.commentId !== null || source.commentPublishedAt !== null)) ||
      row.checkedAt < source.collectedAt || row.updatedAt < row.checkedAt ||
      (source.publishedAt && source.publishedAt > source.collectedAt) ||
      (source.commentPublishedAt && source.commentPublishedAt > source.collectedAt) ||
      (source.factCheck === "official-reference-checked" && !row.officialUrl)) {
      throw new Error("Invalid or duplicate external source " + row.id);
    }
    ids.add(row.id);
    links.add(sourceId);
  }
  return rows;
}

export function mergeExternalSources(existing: unknown, incoming: unknown) {
  const records = new Map(parseExternalSources(existing).map(row => [row.id, row]));
  for (const row of parseExternalSources(incoming)) {
    const current = records.get(row.id);
    if (current && sourceKey(current.platform, current.postUrl) !== sourceKey(row.platform, row.postUrl)) {
      throw new Error("Source identity cannot change for " + row.id);
    }
    records.set(row.id, current ? { ...row, status: current.status } : row);
  }
  return parseExternalSources([...records.values()].sort((a, b) => a.id.localeCompare(b.id)));
}

export function sourceLinkLabel(platform: SourcePlatform, source?: ExternalSource) {
  return source?.locator === "comment_direct" ? "View comment" :
    platform === "YouTube" ? "View video" : "View discussion";
}

export function sourceDate(source?: ExternalSource) {
  return source?.type === "comment" ? source.commentPublishedAt : source?.publishedAt;
}
