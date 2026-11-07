import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StateTheme } from "@/components/StateTheme";
import { hiQuestionCounts } from "@/data/hi-questions";
import { hiCards } from "@/data/hi-cards";
const counts = hiQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Exam Practice" },
  description: `${counts.published} Hawaii notary practice questions and ${hiCards.length} study cards. Independent of the Hawaii Department of the Attorney General.`,
  robots: { index: true, follow: true },
};

export default function HawaiiLayout({ children }: { children: ReactNode }) {
  return (
    <div data-state="HI">
      <StateTheme state="HI" />
      {children}
    </div>
  );
}
