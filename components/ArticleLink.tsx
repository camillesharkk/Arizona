"use client";

import Link from "next/link";
import { useEffect } from "react";
import { rememberArticleEntry, trackAnalyticsEvent } from "@/lib/analytics";

type Entry = { articleId: string; articleState: "CA" | "HI" | "NY" | "PA" | "LA" };

export function ArticleView({ articleId, articleState }: Entry) {
  useEffect(() => {
    const entry = { article_id: articleId, article_state: articleState, entry_placement: "page", target_mode: "read" };
    rememberArticleEntry(entry);
    trackAnalyticsEvent("article_view", entry);
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
        trackAnalyticsEvent("article_cta", entry);
      }}
    >
      {label}
    </Link>
  );
}
