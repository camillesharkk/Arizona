"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isPricingPath, pageViewKey, trackAnalyticsEvent, trackPageView, viewEventForPath } from "@/lib/analytics";
import { freeStateFeatures, isFreeState } from "@/lib/free-state-catalog";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { pathState } from "@/lib/site-state";

export function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const view = viewEventForPath(pathname);
    const state = view === "practice_view" ? pathState(pathname) : null;
    const requested = searchParams.get("mode");
    const quickOnly = isFreeState(state) && freeStateFeatures[state]?.fullPractice === false;
    const mode = !quickOnly && searchParams.get("area") ? "topic" :
      requested === "quick" ? "quick10" :
      !quickOnly && (requested === "full" || requested === "weak") ? requested : "picker";
    // Attempt IDs and the transient start switch are runner state, not page identity.
    const key = pageViewKey(pathname, view === "practice_view" ? (mode === "picker" ? "" : `mode=${mode}`) : searchParams.toString());
    if (lastKey.current !== key) {
      lastKey.current = key;
      trackPageView(key);
    }
    const path = pathname.replace(/\/+$/, "") || "/";
    if (lastPath.current === path) return;
    lastPath.current = path;
    if (view === "practice_view") {
      trackAnalyticsEvent(view, { page_path: pathname, state, mode, ...(mode === "quick10" ? { question_count: 10 } : {}) });
    } else if (view) {
      trackAnalyticsEvent(view, { page_path: key });
    } else if (isPricingPath(pathname)) {
      trackAnalyticsEvent("pricing_view", {
        page_path: pathname,
        ...(path === "/lifetime" ? { product_code: LIFETIME_PRO_PRODUCT_CODE } : {}),
      });
    }
  }, [pathname, searchParams]);

  return null;
}
