"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function PricingAnalytics() {
  const pathname = usePathname();
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (sent.current === pathname) return;
    sent.current = pathname;
    trackAnalyticsEvent("pricing_view");
  }, [pathname]);
  return null;
}
