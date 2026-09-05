"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageViewKey, trackPageView } from "@/lib/analytics";

export function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = pageViewKey(pathname, searchParams.toString());
    if (lastKey.current === key) return;
    lastKey.current = key;
    trackPageView(key);
  }, [pathname, searchParams]);

  return null;
}
