"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { observeUpgradeLinks } from "@/lib/analytics-upgrades";
import { observePendingPurchases } from "@/lib/analytics-recovery";

export function AnalyticsFunnel() {
  const pathname = usePathname();
  useEffect(() => observeUpgradeLinks(), [pathname]);
  useEffect(() => observePendingPurchases(), [pathname]);
  return null;
}
