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
  const hawaii = state === "HI";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: hawaii ? "Hawaii Notary Exam Practice" : california ? "California Notary Exam Practice" : "Arizona Notary Exam Practice Test 2026",
      template: hawaii ? "%s · Hawaii Exam" : california ? "%s · California Exam" : "%s · Arizona Exam",
    },
    description: hawaii
      ? "Hawaii notary practice questions and study cards from published official sources. Independent of the Hawaii Department of the Attorney General."
      : california
      ? "California notary practice questions and study cards from published official sources. Independent of the California Secretary of State."
      : "Free Arizona notary practice test, exam questions, and study guide with official-source citations. Independent of the Arizona Secretary of State.",
    applicationName: hawaii ? "Hawaii Exam" : california ? "California Exam" : site.name,
    robots: { index: true, follow: true },
    openGraph: {
      siteName: hawaii ? "Hawaii Exam" : california ? "California Exam" : site.name,
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
    <html lang="en" data-state={state === "CA" || state === "HI" ? state : undefined}>
      <body>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AnalyticsIdentity />
        <AnalyticsFunnel />
        <Suspense fallback={null}>
          <AnalyticsPageViews />
        </Suspense>
        <JsonLd data={defaultGraph(state === "CA" || state === "HI" ? state : "AZ")} />
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
