"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageViewKey, trackAnalyticsEvent, trackPageView, viewEventForPath } from "@/lib/analytics";

export function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = pageViewKey(pathname, searchParams.toString());
    if (lastKey.current === key) return;
    lastKey.current = key;
    trackPageView(key);
    const view = viewEventForPath(pathname);
    if (view) trackAnalyticsEvent(view, { page_path: key });
  }, [pathname, searchParams]);

  return null;
}
