"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { gaScriptSrc, initializeGa, parseGaMeasurementId } from "@/lib/analytics";

export function GoogleAnalytics() {
  const configured = parseGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(initializeGa());
  }, [configured]);

  if (!configured || !enabled) return null;

  return (
    <>
      <Script src={gaScriptSrc(configured)} strategy="afterInteractive" />
    </>
  );
}
