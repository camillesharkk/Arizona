"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export function PricingAnalytics() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent("pricing_view");
  }, []);
  return null;
}
