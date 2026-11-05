import type { Metadata } from "next";
import { Suspense } from "react";
import { CaliforniaCards } from "@/components/CaliforniaCards";
import { caCards } from "@/data/ca-cards";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Study Cards" },
  description: `${caCards.length} California notary study cards from the handbook and statutes.`,
  alternates: { canonical: `${siteUrl()}/california/study-cards/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California study cards</h1>
      <Suspense fallback={<p className="notice">Loading cards…</p>}>
        <CaliforniaCards />
      </Suspense>
    </main>
  );
}
