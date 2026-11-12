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
  const preview = path.startsWith("/preview/") || path.startsWith("/louisiana");
  const title = state === "NY" ? "New York Notary Exam Practice" : state === "PA" ? "Pennsylvania Notary Exam Practice" : state === "LA" ? "Louisiana Notary Exam Practice" : hawaii ? "Hawaii Notary Exam Practice" : california ? "California Notary Exam Practice" : "Arizona Notary Exam Practice Test 2026";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: preview ? `${title} preview` : title,
      template: "%s",
    },
    description: state === "NY"
      ? "New York notary practice questions and study cards from Department of State sources. Independent of the New York Department of State."
      : state === "PA"
      ? "Pennsylvania notary practice questions from Department of State and Pearson VUE sources. Independent of the Pennsylvania Department of State."
      : hawaii
      ? "Hawaii notary practice questions and study cards from published official sources. Independent of the Hawaii Department of the Attorney General."
      : california
      ? "California notary practice questions and study cards from published official sources. Independent of the California Secretary of State."
      : "Free Arizona notary practice test, exam questions, and study guide with official-source citations. Independent of the Arizona Secretary of State.",
    applicationName: site.legalName,
    robots: preview ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      siteName: site.legalName,
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
    <html lang="en" data-state={state && state !== "AZ" ? state : undefined}>
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
