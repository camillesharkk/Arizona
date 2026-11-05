import type { Metadata } from "next";
import { CaliforniaHome } from "@/components/CaliforniaHome";
import { caCards } from "@/data/ca-cards";
import { caQuestionCounts } from "@/data/ca-questions";
import { CA_EXAM } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Practice" },
  description: `${counts.published} published California notary practice questions and ${caCards.length} study cards. The 10-question check suggests what to study next.`,
  alternates: { canonical: `${siteUrl()}/california/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <CaliforniaHome questionCount={counts.published} cardCount={caCards.length} />
      <p className="notice">
        Sources checked {CA_EXAM.checkedOn}: the Secretary of State handbook and qualifications pages, the current handbook PDF, CPS HR exam information, and the California statutes.
      </p>
    </main>
  );
}
