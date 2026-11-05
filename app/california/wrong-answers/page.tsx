import type { Metadata } from "next";
import { CloudMistakes } from "@/components/CloudMistakes";
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
      <h1>California wrong answers</h1>
      <CloudMistakes stateCode="CA" />
    </main>
  );
}
