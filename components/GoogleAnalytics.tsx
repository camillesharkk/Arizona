"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { gaScriptSrc, parseGaMeasurementId, shouldLoadGa } from "@/lib/analytics";

export function GoogleAnalytics() {
  const configured = parseGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(
      shouldLoadGa({
        measurementId: configured,
        hostname: window.location.hostname,
      })
    );
  }, [configured]);

  if (!configured || !enabled) return null;

  return (
    <>
      <Script src={gaScriptSrc(configured)} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${configured}', { send_page_view: false, anonymize_ip: true });
`}
      </Script>
    </>
  );
}
