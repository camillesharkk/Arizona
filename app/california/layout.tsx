import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StateTheme } from "@/components/StateTheme";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Practice" },
  description: "Free California notary practice questions, study cards, and a 45-question practice exam. Independent of the California Secretary of State and CPS HR.",
  alternates: { canonical: `${siteUrl()}/california/` },
  robots: { index: true, follow: true },
};

export default function CaliforniaLayout({ children }: { children: ReactNode }) {
  return (
    <div data-state="CA">
      <StateTheme state="CA" />
      {children}
    </div>
  );
}
