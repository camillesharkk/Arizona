"use client";

import { useEffect } from "react";
import { syncAnalyticsIdentity } from "@/lib/analytics";

export function AnalyticsIdentity() {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me/")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const user = data?.user;
        void syncAnalyticsIdentity(user ? { id: user.id, plan: user.plan } : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
