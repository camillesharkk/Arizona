"use client";

import type { StateCode } from "@/lib/types";

import Link from "next/link";
import { MemberCopy } from "@/components/MemberCopy";
import { memberActionLabel } from "@/lib/member-copy";
import { useEffect } from "react";
import { rememberArticleEntry, trackAnalyticsEvent } from "@/lib/analytics";

type Entry = { articleId: string; articleState: StateCode };

export function ArticleView({ articleId, articleState }: Entry) {
  useEffect(() => {
    const entry = { article_id: articleId, article_state: articleState, entry_placement: "page", target_mode: "read" };
    trackAnalyticsEvent("article_view", { ...entry, state: articleState, content_id: articleId });
  }, [articleId, articleState]);
  return null;
}

export function ArticleLink({
  articleId,
  articleState,
  href,
  label,
  placement,
  targetMode,
  className,
}: Entry & { href: string; label: string; placement: string; targetMode: string; className?: string }) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        const entry = { article_id: articleId, article_state: articleState, entry_placement: placement, target_mode: targetMode };
        rememberArticleEntry(entry);
        trackAnalyticsEvent("article_cta", { ...entry, state: articleState, content_id: articleId, entry_point: placement, mode: targetMode });
      }}
    >
      <MemberCopy member={memberActionLabel(label)}>{label}</MemberCopy>
    </Link>
  );
}
