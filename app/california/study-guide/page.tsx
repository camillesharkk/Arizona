import type { Metadata } from "next";
import { Suspense } from "react";
import { CaliforniaGuide } from "@/components/CaliforniaGuide";
import { caGuideCheckedOn } from "@/data/ca-study-guide";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Study Guide" },
  description: "California notary rules by study topic, with the official source for each chapter.",
  alternates: { canonical: `${siteUrl()}/california/study-guide/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California study guide</h1>
      <p className="lede">
        Each chapter states the rule, the exception, and a worked example. Checked {caGuideCheckedOn} against the Secretary of State handbook, the qualifications page, and CPS HR. Topic groups on this site are a study outline, not an official question distribution.
      </p>
      <p>
        <a href={CA_EXAM.sources.handbook}>Secretary of State handbook</a>
        {" · "}
        <a href={caPaths.studyCards}>Study cards</a>
      </p>
      <Suspense fallback={<p className="notice">Loading chapters…</p>}>
        <CaliforniaGuide />
      </Suspense>
    </main>
  );
}
