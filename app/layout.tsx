import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/Chrome";
import { SavedStateProvider } from "@/components/SavedState";
import { STATE_COOKIE, parseStateCookie, resolveState } from "@/lib/site-state";
import { JsonLd, defaultGraph } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/site";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";
import { AnalyticsIdentity } from "@/components/AnalyticsIdentity";
import { AnalyticsFunnel } from "@/components/AnalyticsFunnel";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { PaddleCheckoutResume } from "@/components/PaddleCheckoutResume";

export async function generateMetadata(): Promise<Metadata> {
  const saved = parseStateCookie((await cookies()).get(STATE_COOKIE)?.value);
  const path = (await headers()).get("x-pathname") || "";
  const state = resolveState(path, saved);
  const california = state === "CA";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: california ? "California Notary Exam Practice" : "Arizona Notary Exam Practice Test 2026",
      template: california ? "%s · California Exam" : "%s · Arizona Exam",
    },
    description: california
      ? "California notary practice questions and study cards from published official sources. Independent of the California Secretary of State."
      : "Free Arizona notary practice test, exam questions, and study guide with official-source citations. Independent of the Arizona Secretary of State.",
    applicationName: california ? "California Exam" : site.name,
    robots: { index: true, follow: true },
    openGraph: {
      siteName: california ? "California Exam" : site.name,
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const saved = parseStateCookie((await cookies()).get(STATE_COOKIE)?.value);
  const path = (await headers()).get("x-pathname") || "";
  const state = resolveState(path, saved);
  return (
    <html lang="en" data-state={state === "CA" ? "CA" : undefined}>
      <body>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AnalyticsIdentity />
        <AnalyticsFunnel />
        <Suspense fallback={null}>
          <AnalyticsPageViews />
        </Suspense>
        <JsonLd data={defaultGraph()} />
        <SavedStateProvider value={saved}>
          <SiteHeader savedState={saved} />
          <PaddleCheckoutResume successOrigin={siteUrl()} />
          {children}
          <SiteFooter savedState={saved} />
        </SavedStateProvider>
      </body>
    </html>
  );
}
