import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QuestionUpdates } from "@/components/QuestionUpdates";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import "./globals.css";
import "./answer-explanations.css";
import { SiteFooter, SiteHeader } from "@/components/Chrome";
import { SavedStateProvider } from "@/components/SavedState";
import { STATE_COOKIE, parseStateCookie, resolveState } from "@/lib/site-state";
import { JsonLd, defaultGraph } from "@/components/JsonLd";
import { publicBrand } from "@/lib/site";
import { siteUrl } from "@/lib/site";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AnalyticsPageViews } from "@/components/AnalyticsPageViews";
import { AnalyticsIdentity } from "@/components/AnalyticsIdentity";
import { AnalyticsFunnel } from "@/components/AnalyticsFunnel";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { PaddleCheckoutResume } from "@/components/PaddleCheckoutResume";
import { MemberCopyProvider } from "@/components/MemberCopy";
import { EntryMotion } from "@/components/EntryMotion";
import "./entry-motion.css";
import "./editorial-theme.css";
import "./study-workspace.css";

export async function generateMetadata(): Promise<Metadata> {
  const saved = parseStateCookie((await cookies()).get(STATE_COOKIE)?.value);
  const path = (await headers()).get("x-pathname") || "";
  const state = resolveState(path, saved);
  const california = state === "CA";
  const hawaii = state === "HI";
  const preview = path.startsWith("/preview/");
  const title = state === "IN" ? "Indiana Notary Exam Prep" : state === "NC" ? "North Carolina Notary Prep" : state === "CT" ? "Connecticut Notary Prep" : state === "NY" ? "New York Notary Exam Practice" : state === "PA" ? "Pennsylvania Notary Exam Practice" : state === "LA" ? "Louisiana Notary Exam Practice" : hawaii ? "Hawaii Notary Exam Practice" : california ? "California Notary Exam Practice" : "Arizona Notary Exam Practice Test 2026";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: preview ? `${title} preview` : title,
      template: "%s",
    },
    description: state === "IN" ? "Original Indiana notary practice, independent study cards and first-application guidance with official references." : state === "NY"
      ? "New York notary practice questions and study cards from Department of State sources. Independent of the New York Department of State."
      : state === "PA"
      ? "Pennsylvania notary practice questions from Department of State and Pearson VUE sources. Independent of the Pennsylvania Department of State."
      : state === "LA"
      ? "Louisiana statute-based notary scenarios and study cards. Supplement the official 2026 study guide with independent practice."
      : hawaii
      ? "Hawaii notary practice questions and study cards from published official sources. Independent of the Hawaii Department of the Attorney General."
      : california
      ? "California notary practice questions and study cards from published official sources. Independent of the California Secretary of State."
      : "Free Arizona notary practice test, exam questions, and study guide with official-source citations. Independent of the Arizona Secretary of State.",
    applicationName: publicBrand,
    robots: preview ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      siteName: publicBrand,
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestCookies = await cookies();
  const saved = parseStateCookie(requestCookies.get(STATE_COOKIE)?.value);
  const path = (await headers()).get("x-pathname") || "";
  const state = resolveState(path, saved);
  return (
    <html lang="en-US" data-state={state && state !== "AZ" ? state : undefined}>
      <body>
        <EntryMotion />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AnalyticsIdentity />
        <AnalyticsFunnel />
        <Suspense fallback={null}>
          <AnalyticsPageViews />
        </Suspense>
        <JsonLd data={defaultGraph()} />
        <SavedStateProvider value={saved}>
          <MemberCopyProvider>
            <SiteHeader savedState={saved} initialCollapsed={requestCookies.get("np_sidebar")?.value === "1"} indianaPreview={process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1"} />
            <PaddleCheckoutResume successOrigin={siteUrl()} />
            <QuestionUpdates />
            <div className="site-workspace">
              {children}
              <SiteFooter savedState={saved} />
            </div>
          </MemberCopyProvider>
        </SavedStateProvider>
      </body>
    </html>
  );
}
