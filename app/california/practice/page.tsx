import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Practice Test" },
  description: "Check 10 California notary questions or take a 45-question, 60-minute practice exam. Forty items are scored.",
  alternates: { canonical: `${siteUrl()}/california/practice/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California practice</h1>
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch stateCode="CA" />
      </Suspense>
    </main>
  );
}
