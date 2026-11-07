import type { Metadata } from "next";
import { Suspense } from "react";
import { CaliforniaGuide } from "@/components/CaliforniaGuide";
import { hiGuideCheckedOn } from "@/data/hi-study-guide";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Study Guide" },
  description: "Hawaii notary study guide by topic, with the statute or rule for each chapter. Topic groups are this site's outline.",
  alternates: { canonical: `${siteUrl()}/hawaii/study-guide/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii notary study guide</h1>
      <p className="lede">
        Each chapter states the rule, the exception, and an example. Checked {hiGuideCheckedOn} against HRS Chapter 456, HAR Chapter 5-11, and the Attorney General notary pages. The exam page was read again on November 7, 2026: closed book, 80 percent, and no published question count. These chapters are a study outline, not official exam weights. A seven-day order is on the <a href="/hawaii/study-plan/">study plan</a>.
      </p>
      <p>
        <a href={HI_EXAM.sources.statutes}>HRS Chapter 456</a>
        {" · "}
        <a href={hiPaths.studyCards}>Study cards</a>
      </p>
      <Suspense fallback={<p className="notice">Loading chapters…</p>}>
        <CaliforniaGuide state="HI" />
      </Suspense>
    </main>
  );
}
