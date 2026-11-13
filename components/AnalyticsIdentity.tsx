"use client";

import { fetchAccount } from "@/lib/client-account";

import { useEffect } from "react";
import { syncAnalyticsIdentity } from "@/lib/analytics";

export function AnalyticsIdentity() {
  useEffect(() => {
    let cancelled = false;
    fetchAccount()
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
