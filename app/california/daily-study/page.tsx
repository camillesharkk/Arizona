import type { Metadata } from "next";
import { CaliforniaDaily } from "@/components/CaliforniaDaily";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Daily Study" },
  description: "Due California notary reviews for the signed-in account.",
  alternates: { canonical: `${siteUrl()}/california/daily-study/` },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California daily study</h1>
      <CaliforniaDaily />
    </main>
  );
}
