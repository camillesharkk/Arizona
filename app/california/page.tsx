import type { Metadata } from "next";
import { HomeStudy, type StudyPreviewCard } from "@/components/HomeStudy";
import { caCards } from "@/data/ca-cards";
import { caQuestionCounts } from "@/data/ca-questions";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

const counts = caQuestionCounts();
const previewCards: StudyPreviewCard[] = caCards.map((card) => ({
  id: card.id,
  category: card.study,
  title: card.title,
  front: card.front,
  back: card.rule,
  rule: card.rule,
  boundary: card.boundary,
  mixup: card.mixup,
  source: card.source,
  sourceUrl: card.sourceUrl,
  practiceHref: `${caPaths.practice}?mode=practice&area=${card.study}`,
}));

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Practice" },
  description: `${counts.published} published California notary practice questions and ${caCards.length} study cards. The 10-question check suggests what to study next.`,
  alternates: { canonical: `${siteUrl()}/california/` },
};

export default function Page() {
  return (
    <main className="home-canvas">
      <div className="wrap home-main">
        <HomeStudy cards={previewCards} stateCode="CA" />
        <p className="notice">
          Sources checked {CA_EXAM.checkedOn}: the Secretary of State handbook and qualifications pages, the current handbook PDF, CPS HR exam information, and the California statutes. The topic counts on this site are a study outline, not an official exam blueprint.
        </p>
      </div>
    </main>
  );
}
