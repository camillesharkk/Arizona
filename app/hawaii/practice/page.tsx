import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { HI_EXAM } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Practice Test" },
  description: `Free Hawaii notary Quick 10, plus a ${HI_EXAM.practiceQuestionCount}-question Comprehensive Practice with no time limit. This count is this site's practice setting.`,
  alternates: { canonical: `${siteUrl()}/hawaii/practice/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii notary practice test</h1>
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch stateCode="HI" />
      </Suspense>
    </main>
  );
}
