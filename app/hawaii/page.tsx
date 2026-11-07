import type { Metadata } from "next";
import { HomeStudy, type StudyPreviewCard } from "@/components/HomeStudy";
import { hiCards } from "@/data/hi-cards";
import { hiQuestionCounts } from "@/data/hi-questions";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { canonicalUrl } from "@/lib/site";

const counts = hiQuestionCounts();
const previewCards: StudyPreviewCard[] = hiCards.map((card) => ({
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
  practiceHref: `${hiPaths.practice}?mode=practice&area=${card.study}`,
}));

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Practice Test" },
  description: `Hawaii notary practice test with ${counts.published} published questions and ${hiCards.length} study cards. Quick 10 is free. Comprehensive Practice is this site's 50-question set.`,
  alternates: { canonical: canonicalUrl("/hawaii/") },
};

export default function Page() {
  return (
    <main className="home-canvas">
      <div className="wrap home-main">
        <HomeStudy cards={previewCards} stateCode="HI" />
        <p className="notice">
          Official written exam, checked {HI_EXAM.checkedOn}: closed book, at least {HI_EXAM.officialPassingPercent}% (HAR §5-11-32). Question count, time limit, item type, and topic weights are not published. {HI_EXAM.practiceNote} Scores on this site are not an official result.
        </p>
      </div>
    </main>
  );
}
