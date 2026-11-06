import type { Metadata } from "next";
import { Suspense } from "react";
import { CaliforniaMistakes } from "@/components/CaliforniaMistakes";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Wrong Answers" },
  description: "California notary questions missed in this browser.",
  alternates: { canonical: `${siteUrl()}/california/wrong-answers/` },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="wrap">
      <Suspense fallback={<p className="notice">Loading mistakes…</p>}>
        <CaliforniaMistakes />
      </Suspense>
    </main>
  );
}
