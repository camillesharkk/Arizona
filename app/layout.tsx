import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/Chrome";
import { JsonLd, defaultGraph } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Arizona Notary Exam Practice Test 2026",
    template: "%s · Arizona Exam",
  },
  description:
    "Free Arizona notary practice test, exam questions, and study guide with official-source citations. Independent of the Arizona Secretary of State.",
  applicationName: site.name,
  robots: { index: true, follow: true },
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <AnalyticsPageViews />
        </Suspense>
        <JsonLd data={defaultGraph()} />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
