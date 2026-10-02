"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { isSensitiveAnalyticsPath, parseClarityProjectId, shouldLoadClarity } from "@/lib/analytics";

function maskSensitiveFields() {
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.classList.add("clarity-mask");
  });
}

export function MicrosoftClarity() {
  const configured = parseClarityProjectId(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
  const pathname = usePathname() || "";
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(
      shouldLoadClarity({
        projectId: configured,
        hostname: window.location.hostname,
      })
    );
  }, [configured]);

  useEffect(() => {
    if (!enabled) return;
    maskSensitiveFields();
    const sensitive = isSensitiveAnalyticsPath(pathname);
    document.body.classList.toggle("clarity-mask", sensitive);
    if (sensitive) window.clarity?.("stop");
    else if (window.clarity) window.clarity("start");
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        target.classList.add("clarity-mask");
      }
    };
    document.addEventListener("focusin", onFocus, true);
    return () => {
      document.removeEventListener("focusin", onFocus, true);
      document.body.classList.remove("clarity-mask");
    };
  }, [enabled, pathname]);

  if (!configured || !enabled || isSensitiveAnalyticsPath(pathname)) return null;

  return (
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${configured}");
`}
    </Script>
  );
}
