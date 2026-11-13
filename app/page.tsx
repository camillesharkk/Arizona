import type { Metadata } from "next";
import { StatePicker } from "@/components/StatePicker";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Choose Your State · Notary Exam Prep" },
  description: "Select your state to find notary practice questions and study materials.",
  alternates: { canonical: canonicalUrl("/") },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="wrap state-picker-page">
      <h1>Choose Your State</h1>
      <p className="home-lead">Select your state to find notary practice questions and study materials.</p>
      <StatePicker indianaPreview={process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1"} />
    </main>
  );
}
